import { useState, useEffect } from "react";

export default function useFriendtechData(accountAddress: String) {

  const [holders, setHolders] = useState<string[]>([]);
  const [error, setError] = useState(null);

  const apiURL = `https://prod-api.kosetto.com/users/${accountAddress.toString()}/token/holders`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiURL);

        if (!response.ok) {
          throw new Error("Failed to fetch");
        }

        const data = await response.json();
        console.log(data);

        // Map over the data to extract the desired properties
        const extractedData = data.users.map((user: any) => user.address);

        setHolders(extractedData);
      } catch (err) {
        setError(err);
      }
    };

    fetchData();
  }, [apiURL]);
  return { holders, error };
}
