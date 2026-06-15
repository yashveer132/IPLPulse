import { useState, useEffect } from 'react';

export function usePlayerPhoto(playerName) {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerName) {
      setPhotoUrl(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setPhotoUrl(null);

    async function fetchPhoto() {
      try {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(playerName + ' cricketer')}&utf8=&format=json&origin=*`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData.query.search.length === 0) {
          if (isMounted) setLoading(false);
          return;
        }

        const pageId = searchData.query.search[0].pageid;

        const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageId}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
        const imageRes = await fetch(imageUrl);
        const imageData = await imageRes.json();

        const page = imageData.query.pages[pageId];

        if (page && page.thumbnail && page.thumbnail.source) {
          if (isMounted) {
            setPhotoUrl(page.thumbnail.source);
            setLoading(false);
          }
        } else {
          if (isMounted) setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch player photo from Wikipedia', err);
        if (isMounted) setLoading(false);
      }
    }

    fetchPhoto();

    return () => {
      isMounted = false;
    };
  }, [playerName]);

  return { photoUrl, loading };
}
