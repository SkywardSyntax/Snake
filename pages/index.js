import { useRouter } from 'next/router';
import styled, { keyframes } from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
  border-radius: 10px;
`;

const Button = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 10px 20px;
  cursor: pointer;
  margin-top: 20px;
  transition: background 0.3s ease-in-out;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const AnimatedButton = styled(Button)`
  animation: ${fadeIn} 0.5s ease-in-out;
`;

export default function Home() {
  const router = useRouter();

  const handleGameModeSelection = (mode) => {
    router.push({
      pathname: '/game',
      query: { mode },
    });
  };

  return (
    <Container>
      <h1>Select Game Mode</h1>
      <AnimatedButton onClick={() => handleGameModeSelection('default')}>
        Default Game
      </AnimatedButton>
      <AnimatedButton onClick={() => handleGameModeSelection('noBorders')}>
        No Borders Game
      </AnimatedButton>
    </Container>
  );
}
