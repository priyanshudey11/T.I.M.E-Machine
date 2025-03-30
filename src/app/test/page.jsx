"use client";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function TestPage() {
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    async function fetchCharacters() {
      const { data, error } = await supabase.from("Characters").select("*");
      console.log("Fetched characters:", data);
      console.log("Error (if any):", JSON.stringify(error, null, 2));

      if (error) {
        console.error("💥 Supabase error!", error.message);
      } else {
        setCharacters(data);
      }
    }

    fetchCharacters();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Characters from Supabase:</h1>
      {characters.length === 0 ? (
        <p>No characters found.</p>
      ) : (
        characters.map((char) => (
          <div key={char.id}>
            <p><strong>Name:</strong> {char.name}</p>
            <p><strong>Era:</strong> {char.era}</p>
            <p><strong>Personality:</strong> {char.personality}</p>
            <hr />
          </div>
        ))
      )}
    </div>
  );
}
