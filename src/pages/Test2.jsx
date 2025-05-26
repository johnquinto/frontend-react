// import React, { useEffect, useState } from 'react';
// import dayjs from 'dayjs';

// const CurrentTime = () => {
//   const [dateTime, setDateTime] = useState('Carregando...');

//   useEffect(() => {
//     const fetchDateTime = async () => {
//       try {
//         const response = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=Africa/Luanda');
//         const data = await response.json();
//         console.log(data);
//         setDateTime(dayjs(data.dateTime).format('YYYY-MM-DD HH:mm:ss'));
//       } catch {
//         setDateTime('Erro ao buscar a data!');
//       }
//     };

//     fetchDateTime();
//   }, []);

//   return (
//     <div style={{ textAlign: 'center', padding: '20px' }}>
//       <p>Data e Hora Atual: <strong>{dateTime}</strong></p>
//     </div>
//   );
// };

// export default CurrentTime;
