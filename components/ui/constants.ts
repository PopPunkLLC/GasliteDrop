export const AGE_OPTIONS = [
  {
    value: 0,
    label: "None",
  },
  {
    value: 1,
    label: "1 week",
  },
  {
    value: 4,
    label: "1 month",
  },
  {
    value: 26,
    label: "6 months",
  },
  {
    value: 52,
    label: "1 year",
  },
];

export const DEFAULT_TWITTER_EXCLUSIONS = {
  minFollowerCount: 100,
  minTweetCount: 100,
  minAccountAge: 4,
  hasProfile: true,
  hasDescription: false,
  hasLocation: false,
  token: {
    address: "",
    chainId: "",
  },
};
