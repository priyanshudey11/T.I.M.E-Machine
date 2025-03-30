// src/components/Character.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Window, WindowHeader, WindowContent, Button } from 'react95';

const characterDetails = {
  tesla: { name: 'Nikola Tesla', bio: 'Inventor and electrical engineer.' },
  edison: { name: 'Thomas Edison', bio: 'Inventor and businessman.' },
  einstein: { name: 'Albert Einstein', bio: 'Physicist known for the theory of relativity.' },
  monroe: { name: 'Marilyn Monroe', bio: 'Iconic actress and model.' },
  roosevelt: { name: 'Theodore Roosevelt', bio: '26th President of the United States.' },
};

const Character = () => {
  const { id } = useParams();
  const character = characterDetails[id];

  if (!character) return <p>Character not found.</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <Window style={{ width: 400 }}>
        <WindowHeader active>
          <span>{character.name}</span>
        </WindowHeader>
        <WindowContent>
          <p>{character.bio}</p>
          <p style={{ animation: 'blink 1s step-start infinite' }}>Click below to chat!</p>
          <Link to={`/chat/${id}`}>
            <Button variant="raised">Start Chat</Button>
          </Link>
        </WindowContent>
      </Window>
    </div>
  );
};

export default Character;
