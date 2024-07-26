import {PlayerAverageStatistics, PlayerStatistics} from '../models';

export interface PlayerProfileWithDetails {
  username: string;
  email: string;
  mobileNumber: string;
  id: number;
  firstName: string;
  lastName: string;
  playerStatistics?: PlayerStatistics;
  playerAverageStatistics?: PlayerAverageStatistics;
}
