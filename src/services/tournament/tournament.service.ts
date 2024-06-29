import {injectable, BindingScope, inject} from '@loopback/core';
import {repository, IsolationLevel, juggler} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {
  TournamentRepository,
  TournamentTeamRepository,
  TournamentTeamPlayerRepository,
  TournamentDetailsRepository
} from '../../repositories';
import {Tournament} from '../../models';

interface TeamData {
  name: string;
  players: Array<{profileId: number}>;
}

@injectable({scope: BindingScope.TRANSIENT})
export class TournamentService {
  constructor(
    @repository(TournamentRepository)
    private tournamentRepository: TournamentRepository,
    @repository(TournamentTeamRepository)
    private tournamentTeamRepository: TournamentTeamRepository,
    @repository(TournamentTeamPlayerRepository)
    private tournamentTeamPlayerRepository: TournamentTeamPlayerRepository,
    @repository(TournamentDetailsRepository)
    private tournamentDetailsRepository: TournamentDetailsRepository,
  ) {}

  async registerTeam(tournamentId: number, teamData: TeamData, createdBy: number): Promise<Tournament> {
    const db: juggler.DataSource = this.tournamentRepository.dataSource;
    const transaction = await db.beginTransaction(IsolationLevel.READ_COMMITTED);
    try {
      console.log('Registering team with data:', teamData, 'for tournament ID:', tournamentId, 'created by:', createdBy);

      // Prepare the team data without players
      const team: any = {
        name: teamData.name,
        tournamentId,
        createdById: createdBy,
        teamSize: teamData.players.length, // Set the team size
      };

      // Create the team
      const createdTeam = await this.tournamentTeamRepository.create(team, {transaction});

      console.log('Team created successfully:', createdTeam);

      // Prepare and create players associated with the team
      const players = teamData.players.map(player => ({
        profileId: player.profileId,
        createdById: createdBy,
        updatedById: createdBy,
        tournamentTeamId: createdTeam.id,
        status: 'Registered',
      }));

      await this.tournamentTeamPlayerRepository.createAll(players, {transaction});

      console.log('Players created successfully:', players);

      // Commit the transaction
      await transaction.commit();

      // Return the updated tournament with the new team and players
      const updatedTournament = await this.tournamentRepository.findById(tournamentId, {
        include: [{relation: 'teams', scope: {include: ['players']}}],
      });

      console.log('Updated tournament with new team:', updatedTournament);

      return updatedTournament;
    } catch (err) {
      // Rollback the transaction in case of an error
      await transaction.rollback();
      console.error('Error registering team:', err); // Detailed error logging
      // Check for database-related errors and return appropriate responses
      if (err.code === 'ER_NO_REFERENCED_ROW' || err.code === 'ER_ROW_IS_REFERENCED') {
        throw new HttpErrors.BadRequest('Invalid foreign key or reference.');
      } else if (err.code === 'ER_DUP_ENTRY') {
        throw new HttpErrors.Conflict('Duplicate entry.');
      } else if (err instanceof HttpErrors.HttpError) {
        throw err;
      } else {
        throw new HttpErrors.InternalServerError('Error registering team for the tournament.');
      }
    }
  }

  async updatePlayerStatus(tournamentId: number, teamId: number, playerId: number, status: string): Promise<void> {
    const db: juggler.DataSource = this.tournamentRepository.dataSource;
    const transaction = await db.beginTransaction(IsolationLevel.READ_COMMITTED);
    try {
      const tournamentDetails = await this.tournamentDetailsRepository.findOne({
        where: { tournamentId },
      });

      if (!tournamentDetails) {
        throw new HttpErrors.NotFound('Tournament details not found.');
      }

      if (status === 'Checked In' && tournamentDetails.tournamentStatus !== 'Check In') {
        throw new HttpErrors.BadRequest('Check-in is not open for this tournament.');
      }

      const player = await this.tournamentTeamPlayerRepository.findOne({
        where: {
          tournamentTeamId: teamId,
          profileId: playerId,
          status: status === 'Checked In' ? 'Registered' : 'Checked In',
        },
      });

      if (!player) {
        throw new HttpErrors.NotFound('Player not found.');
      }

      player.status = status;
      await this.tournamentTeamPlayerRepository.updateById(player.id, { status: player.status }, {transaction});

      console.log(`Player ${playerId} ${status === 'Checked In' ? 'checked in' : 'checked out'} for team ${teamId} in tournament ${tournamentId}.`);

      // Fetch the team along with its players to check if all players are checked in
      const team = await this.tournamentTeamRepository.findById(teamId, {
        include: [{relation: 'players'}],
      });

      if (!team.players) {
        throw new HttpErrors.NotFound('Team not found.');
      }

      const checkedInPlayersCount = team.players.filter(player => player.status === 'Checked In').length;

      // Logic to update team status based on player statuses
      if (checkedInPlayersCount >= team.teamSize) {
        await this.tournamentTeamRepository.updateById(team.id, { teamStatus: 'Checked In' }, {transaction});
        console.log(`Team ${teamId} is now fully checked in.`);
      } else if (checkedInPlayersCount < team.teamSize && team.teamStatus === 'Checked In') {
        await this.tournamentTeamRepository.updateById(team.id, { teamStatus: 'Registered' }, {transaction});
        console.log(`Team ${teamId} status reverted to Registered.`);
      }

      // Commit the transaction
      await transaction.commit();
    } catch (err) {
      // Rollback the transaction in case of an error
      await transaction.rollback();
      console.error('Error during player status update:', err);
      if (err instanceof HttpErrors.HttpError) {
        throw err;
      } else {
        throw new HttpErrors.InternalServerError('Error processing status update request.');
      }
    }
  }

}
