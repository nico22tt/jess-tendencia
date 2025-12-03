import { useState, useEffect } from 'react';

export function useRecommendations(userId?: string) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    fetch(`/api/recommendations?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setRecommendations(data);
        setError(null);
      })
      .catch(err => {
        setError('Error cargando recomendaciones');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return { recommendations, loading, error };
}
