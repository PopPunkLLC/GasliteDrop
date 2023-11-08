import { useState, useEffect } from "react";

const FT_BASE_URI = "https://prod-api.kosetto.com";

const useFriendTechData = ({ address }) => {
  const [data, setData] = useState<string[]>([]);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<any>(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const holders = await fetch(
        `${FT_BASE_URI}/users/${String(address)}/token/holders`
      )
        .then((res) => res.json())
        .then(({ users }) => users?.map(({ address }) => address));
      setData(holders);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchData();
    } else {
      setData(null);
      setIsLoading(false);
    }
  }, [address]);
  return { data, error, isLoading };
};

export default useFriendTechData;
