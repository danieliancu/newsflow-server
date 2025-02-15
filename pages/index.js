import React, { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/scrape')
      .then((response) => response.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Se încarcă...</p>;
  if (error) return <p>Eroare: {error.message}</p>;

  return (
    <div>
      <h1>Rezultatele scraping-ului</h1>
      {data && Object.keys(data).length > 0 ? (
        Object.entries(data).map(([site, results]) => (
          <div key={site}>
            <h2>{site}</h2>
            <ul>
              {results.map((item, index) => (
                <a key={index} href={item.link} target="_blank" rel="noopener noreferrer">
                  <li>
                    <strong>{item.name}</strong>
                    <p>{item.label}</p>
                    <h3>{item.h1 || 'Fără titlu'}</h3>
                    <p>{item.intro}</p>
                    {item.error && <p style={{ color: 'red' }}>Eroare: {item.error}</p>}
                    {item.imgSrc && (
                      <img
                        src={item.imgSrc}
                        alt="article"
                        style={{ objectFit: "cover", border: "1px solid black", width: "300px", height: "200px" }}
                      />
                    )}
                    <hr />
                  </li>
                </a>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>Nu s-au găsit rezultate.</p>
      )}
    </div>
  );
}
