export const CronJobConfig = [
  {
    jobName: 'nightlyProcessing',
    schedTime: '0 0 * * *', // Every day at midnight
    mustPass: true,
    data: {},
  },
  {
    jobName: 'monthlyProcessing',
    schedTime: '0 0 1 * *', // On the first day of each month
    mustPass: true,
    data: {},
  },
];
