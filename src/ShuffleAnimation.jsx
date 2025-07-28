import React, { useState, useEffect, useRef } from 'react';
import './ShuffleAnimation.css';

const ShuffleAnimation = ({ onAnimationComplete }) => {
  const [cards, setCards] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const deckRef = useRef(null);
  
  const CARD_COUNT = 52;

  // Crear partículas flotantes
  const createParticles = () => {
    const particles = [];
    for (let i = 0; i < 25; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        delay: Math.random() * 8
      });
    }
    return particles;
  };

  const particles = createParticles();

  // Inicializar cartas
  useEffect(() => {
    initializeDeck();
    startShuffle();
  }, []);

  const initializeDeck = () => {
    const newCards = [];
    for (let i = 0; i < CARD_COUNT; i++) {
      newCards.push({
        id: i,
        x: 0,
        y: -i * 1.2,
        rotation: 0,
        zIndex: CARD_COUNT - i,
        scale: 1,
        shadow: '0 4px 15px rgba(0,0,0,0.4)'
      });
    }
    setCards(newCards);
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const updateCards = (updates) => {
    setCards(prevCards => 
      prevCards.map(card => {
        const update = updates[card.id];
        return update ? { ...card, ...update } : card;
      })
    );
  };

  // Eliminar las manos de la animación
  const startShuffle = async () => {
    setIsShuffling(true);

    await sleep(800);

    // Fase 1: Cortar el mazo
    await cutDeck();

    // Fase 2: Preparar riffle
    await sleep(600);

    // Fase 3: Riffle
    await riffleCards();

    // Fase 4: Bridge
    await bridgeCards();

    // Fase 5: Square up
    await squareUp();

    setIsShuffling(false);

    // Notificar que terminó
    setTimeout(() => {
        if (onAnimationComplete) onAnimationComplete();
    }, 2000);
  };

  const cutDeck = async () => {
    const halfCount = Math.floor(CARD_COUNT / 2);
    const updates = {};
    
    for (let i = 0; i < CARD_COUNT; i++) {
      setTimeout(() => {
        if (i < halfCount) {
          updates[i] = {
            x: -325,
            y: -i * 1.8,
            rotation: -6,
            shadow: '0 8px 25px rgba(255,107,107,0.5)',
            scale: 1.02
          };
        } else {
          updates[i] = {
            x: 200,
            y: -(i - halfCount) * 1.8,
            rotation: 6,
            shadow: '0 8px 25px rgba(78,205,196,0.5)',
            scale: 1.02
          };
        }
        updateCards(updates);
      }, i * 40);
    }
    
    await sleep(2000);
  };

  const riffleCards = async () => {
    const halfCount = Math.floor(CARD_COUNT / 2);
    const updates = {};
    let finalPosition = 0;
    
    // Crear un patrón de mezclado más limpio y suave
    const shufflePattern = [];
    let leftIndex = 0;
    let rightIndex = halfCount;
    
    // Crear un patrón alternado con algunas variaciones naturales
    while (leftIndex < halfCount && rightIndex < CARD_COUNT) {
      // Alternar entre 1-2 cartas de cada lado para hacer más realista
      const leftBurst = Math.random() > 0.5 ? 1 : 2;
      const rightBurst = Math.random() > 0.5 ? 1 : 2;
      
      // Agregar cartas del lado izquierdo
      for (let i = 0; i < leftBurst && leftIndex < halfCount; i++) {
        shufflePattern.push(leftIndex++);
      }
      
      // Agregar cartas del lado derecho
      for (let i = 0; i < rightBurst && rightIndex < CARD_COUNT; i++) {
        shufflePattern.push(rightIndex++);
      }
    }
    
    // Agregar las cartas restantes
    while (leftIndex < halfCount) shufflePattern.push(leftIndex++);
    while (rightIndex < CARD_COUNT) shufflePattern.push(rightIndex++);
    
    // Animar las cartas al centro de forma suave
    for (let i = 0; i < shufflePattern.length; i++) {
      const cardId = shufflePattern[i];
      setTimeout(() => {
        updates[cardId] = {
          x: -85, // Posición fija en el centro
          y: -finalPosition * 1.1, // Espaciado uniforme
          rotation: 0, // Sin rotación para que se vea más limpio
          zIndex: finalPosition,
          shadow: '0 6px 20px rgba(0,0,0,0.4)',
          scale: 1
        };
        updateCards(updates);
        finalPosition++;
      }, i * 60); // Timing suave y constante
    }
    
    await sleep(shufflePattern.length * 60 + 500);
  };

  const bridgeCards = async () => {
    const updates = {};
    
    for (let i = 0; i < CARD_COUNT; i++) {
      setTimeout(() => {
        const progress = i / CARD_COUNT;
        const bridgeHeight = Math.sin(progress * Math.PI) * 35;
        const bridgeRotation = Math.sin(progress * Math.PI * 2) * 4;
        
        updates[i] = {
          x: -90, // Mantener posición fija en X, sin movimiento horizontal
          y: cards[i]?.y - bridgeHeight || -i * 1.2 - bridgeHeight,
          rotation: bridgeRotation,
          shadow: '0 15px 40px rgba(0,0,0,0.6)',
          scale: 1.08
        };
        updateCards(updates);
      }, i * 30);
    }
    
    await sleep(1600);
  };

  const squareUp = async () => {
    const updates = {};
    
    for (let i = 0; i < CARD_COUNT; i++) {
      setTimeout(() => {
        updates[i] = {
          x: -85,
          y: -i * 1.2,
          rotation: 0,
          zIndex: CARD_COUNT - i,
          shadow: '0 4px 15px rgba(0,0,0,0.4)',
          scale: 1
        };
        updateCards(updates);
      }, i * 35);
    }
    
    await sleep(1600);
  };

  return (
    <div className="shuffle-container">
      {/* Título */}
      <div className="title">
        SHUFFLE AMERICANO 
      </div>

      {/* Mesa elegante */}
      <div className="table">
        
        {/* Efectos de luz en la mesa */}
        <div className="table-glow" />
        
        {/* Mazo de cartas */}
        <div ref={deckRef} className="deck-container">
          {cards.map((card) => (
            <div
              key={card.id}
              className="card"
              style={{
                left: `${card.x}px`,
                top: `${card.y}px`,
                transform: `rotate(${card.rotation}deg) scale(${card.scale})`,
                zIndex: card.zIndex,
                boxShadow: card.shadow
              }}
            >
              {/* Fondo de carta con imagen personalizada */}
              <div className="card-back">
                <img 
                  src="/Cartas/ParteTrasera.png" 
                  alt="Reverso de carta"
                  className="card-back-image"
                />
              </div>
              
              {/* Brillo dinámico */}
              <div 
                className="card-shimmer"
                style={{ animationDelay: `${card.id * 0.1}s` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShuffleAnimation;