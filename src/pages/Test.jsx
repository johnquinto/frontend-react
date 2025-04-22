// import React, { useState } from "react";

// const UsernameInput = () => {
//   const [username, setUsername] = useState("");
//   const [error, setError] = useState("");

//   // Função de validação
//   const validateUsername = (value) => {
//     const regex = /^[a-z][a-z0-9._]{9,14}$/; // Regras definidas
//     if (!regex.test(value)) {
//       setError(
//         "O nome de usuário deve começar com uma letra, ter entre 3 e 15 caracteres e conter apenas letras, números, _ ou ."
//       );
//     } else {
//       setError(""); // Limpa o erro se válido
//     }
//   };

//   // Manipula a mudança no input
//   const handleChange = (e) => {
//     const value = e.target.value.trim()
//     setUsername(value);
//     validateUsername(value);
//   };

//   return (
//     <div>
//       <label htmlFor="username">Nome de Usuário:</label>
//       <input
//         type="text"
//         id="username"
//         value={username}
//         onChange={handleChange}
//         placeholder="Digite seu nome de usuário"
//       />
//       {error && <p style={{ color: "red" }}>{error}</p>}
//     </div>
//   );
// };

// export default UsernameInput;

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

const CurrentTime = () => {
  const [dateTime, setDateTime] = useState('Carregando...');

  useEffect(() => {
    const fetchDateTime = async () => {
      try {
        const response = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=Africa/Luanda');
        const data = await response.json();
        console.log(data);
        setDateTime(dayjs(data.dateTime).format('YYYY-MM-DD'));
      } catch {
        setDateTime('Erro ao buscar a data!');
      }
    };

    fetchDateTime();
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <p>Data e Hora Atual: <strong>{dateTime}</strong></p>
    </div>
  );
};

export default CurrentTime;
