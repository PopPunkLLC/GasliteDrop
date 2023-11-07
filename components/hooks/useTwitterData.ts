import { useState, useEffect } from "react";

const useTwitterData = ({ tweetId }) => {
  const [data, setData] = useState<string[]>([]);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<any>(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { addresses } = await fetch(`/api/tweet?id=${tweetId}`).then(
        (res) => res.json()
      );
      setData(addresses);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tweetId) {
      fetchData();
    } else {
      setData(null);
      setIsLoading(false);
    }
  }, [tweetId]);
  return { data, error, isLoading };
};

export default useTwitterData;
