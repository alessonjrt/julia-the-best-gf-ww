import React, { useEffect, useRef, useState } from 'react';
import amorImage from './assets/amor.jpeg';
import hitSound from './assets/chaves-pancada.mp3';
import hammerImage from './assets/hammer.png';
import pImage from './assets/p.png';
import clapSound from './assets/salma-de-palmas.mp3';
import yoImage from './assets/yo.png';

interface Rect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
} 

const App: React.FC = () => {
  const [moveCount, setMoveCount] = useState(0);
  const [primaryButtonPos, setPrimaryButtonPos] = useState<{ top: number; left: number }>({
    top: window.innerHeight / 2 + 100,
    left: window.innerWidth / 2 - 100,
  });
  const [showHelpButton, setShowHelpButton] = useState(false);
  const [showHelpContainer, setShowHelpContainer] = useState(false);
  const [helpContainerPos, setHelpContainerPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [modalVisible, setModalVisible] = useState(false);

  // Refs para os elementos que não podem ser sobrepostos
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const centralImageRef = useRef<HTMLImageElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const helpContainerRef = useRef<HTMLDivElement>(null);

  // Quando o modal aparece, espera 1 segundo antes de tocar o som de palmas
  useEffect(() => {
    if (modalVisible) {
      setTimeout(() => {
        const audio = new Audio(clapSound);
        audio.play();
      }, 1000);
    }
  }, [modalVisible]);

  const checkOverlap = (r1: Rect, r2: DOMRect) => {
    return !(r1.right < r2.left ||
             r1.left > r2.right ||
             r1.bottom < r2.top ||
             r1.top > r2.bottom);
  };

  const forbiddenOverlap = (candidate: Rect, forbiddenRects: DOMRect[]): boolean => {
    return forbiddenRects.some(rect => checkOverlap(candidate, rect));
  };

  // Função para mover o botão, garantindo que não fique sobre elementos indesejados
  const moveButton = () => {
    const buttonWidth = 200;
    const buttonHeight = 50;

    const forbiddenRects: DOMRect[] = [];
    if (centralImageRef.current) {
      forbiddenRects.push(centralImageRef.current.getBoundingClientRect());
    }
    if (headerRef.current) {
      forbiddenRects.push(headerRef.current.getBoundingClientRect());
    }
    if (showHelpButton && helpButtonRef.current) {
      forbiddenRects.push(helpButtonRef.current.getBoundingClientRect());
    }

    let newLeft = 0;
    let newTop = 0;
    let attempts = 0;
    let candidate: Rect;

    do {
      newLeft = Math.random() * (window.innerWidth - buttonWidth);
      newTop = Math.random() * (window.innerHeight - buttonHeight);
      candidate = {
        top: newTop,
        left: newLeft,
        right: newLeft + buttonWidth,
        bottom: newTop + buttonHeight,
        width: buttonWidth,
        height: buttonHeight,
      };
      attempts++;
      if (attempts > 100) break;
    } while (forbiddenOverlap(candidate, forbiddenRects));

    setPrimaryButtonPos({ top: newTop, left: newLeft });
    setMoveCount(prev => prev + 1);
    if (moveCount + 1 >= 5 && !showHelpButton) {
      setShowHelpButton(true);
    }
  };

  // Ao clicar no botão de ajuda, exibe o container que agrupa yo.png e hammer.png e inicia sua animação
  const handleHelpButtonClick = () => {
    if (primaryButtonRef.current) {
      setHelpContainerPos({ top: 0, left: 0 });
      setShowHelpContainer(true);
      setTimeout(() => {
        const rect = primaryButtonRef.current!.getBoundingClientRect();
        const targetTop = rect.top + rect.height / 2 - 50;
        const targetLeft = rect.left + rect.width / 2 - 50;
        setHelpContainerPos({ top: targetTop, left: targetLeft });
      }, 100);
    }
  };

  // Quando o container termina sua transição, simula a pancada, toca o som de pancada e depois exibe o modal
  const handleHelpContainerTransitionEnd = () => {
    if (helpContainerRef.current) {
      helpContainerRef.current.classList.add('hammer-hit');
    }
    const audio = new Audio(hitSound);
    audio.play();
    setTimeout(() => {
      setShowHelpContainer(false);
      setModalVisible(true);
      if (helpContainerRef.current) {
        helpContainerRef.current.classList.remove('hammer-hit');
      }
    }, 300);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'pink',
        overflow: 'hidden',
      }}
    >
      {/* Container da imagem central flutuante e da imagem que aponta abaixo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '50px' }}>
        <img
          ref={centralImageRef}
          src={amorImage}
          alt="Imagem Central"
          style={{
            width: 200,
            height: 200,
            objectFit: 'cover',
            borderRadius: '10px',
            animation: 'float 3s ease-in-out infinite',
          }}
        />
        <img
          src={pImage}
          alt="Apontador"
          style={{
            width: 120,
            height: 'auto',
            marginTop: '10px',
          }}
        />
      </div>

      {/* Título */}
      <h1 ref={headerRef} style={{ textAlign: 'center', marginTop: '20px' }}>
        The World's Best GF!
      </h1>

      {/* Botão principal que se move */}
      <button
        ref={primaryButtonRef}
        onClick={moveButton}
        style={{
          position: 'absolute',
          top: primaryButtonPos.top,
          left: primaryButtonPos.left,
          padding: '10px 20px',
          transition: 'top 0.5s, left 0.5s',
          cursor: 'pointer',
        }}
      >
        Clique aqui para ganhar seu premio
      </button>

      {/* Botão de ajuda, exibido após 5 cliques */}
      {showHelpButton && (
        <button
          ref={helpButtonRef}
          onClick={handleHelpButtonClick}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            cursor: 'pointer',
          }}
        >
          Pedir ajuda pro Alesson
        </button>
      )}

      {/* Container que agrupa as imagens yo.png e hammer.png que animam juntas */}
      {showHelpContainer && (
        <div
          ref={helpContainerRef}
          style={{
            position: 'absolute',
            top: helpContainerPos.top,
            left: helpContainerPos.left,
            transition: 'top 1.2s ease-out, left 1.2s ease-out',
            display: 'flex',
            alignItems: 'center',
          }}
          onTransitionEnd={handleHelpContainerTransitionEnd}
        >
          <img
            src={yoImage}
            alt="Yo"
            style={{ width: 60, height: 60, marginRight: '10px' }}
          />
          <img
            src={hammerImage}
            alt="Martelo"
            style={{ width: 60, height: 60 }}
          />
        </div>
      )}

      {/* Modal final */}
      {modalVisible && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}
  >
    <div
      style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        margin: '20px',
        textAlign: 'center',
        maxWidth: '90%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}
    >
      {/* Imagem decorativa */}
   

      <h2 style={{ color: '#333', marginBottom: '20px', fontSize: '1.5rem' }}>
        🎉🎈 Parabéns, amor!!! Você ganhou um vale cabana 🏕️💖✨
      </h2>

      <a
        href={`https://wa.me/5549999524735?text=${encodeURIComponent(
          'Oi amor adorei o presente etc e tal quero resgatar meu vale cabana 💖🏕️'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          backgroundColor: '#25D366',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '1rem',
          display: 'inline-block',
          marginTop: '10px',
        }}
      >
        📱 Resgatar meu vale
      </a>
    </div>
  </div>
)}

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes hammerHit {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(-15deg) scale(1.1); }
          100% { transform: rotate(0deg) scale(1); }
        }
        .hammer-hit {
          animation: hammerHit 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default App;
