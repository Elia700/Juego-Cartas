import React, { useState } from 'react';
import ShuffleAnimation from './ShuffleAnimation';
import InstallPWAButton from './InstallPWAButton';

const App = () => {
  // Estados principales del juego
  const [deck, setDeck] = useState([]);
  const [piles, setPiles] = useState([]);
  const [question, setQuestion] = useState('');
  const [activePile, setActivePile] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameMessage, setGameMessage] = useState('');
  const [isShuffling, setIsShuffling] = useState(false);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const [firstClick, setFirstClick] = useState(true);
  const [showShuffle, setShowShuffle] = useState(false);
  
  // Estados para drag & drop
  const [draggedCard, setDraggedCard] = useState(null);
  const [dragSourcePile, setDragSourcePile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validDropTargets, setValidDropTargets] = useState([]);
  const [currentRevealedCard, setCurrentRevealedCard] = useState(null);

  // Validaciones
  const canStartGame = question.trim().length > 0 && !gameStarted;
  const canShuffle = question.trim().length > 0 && !gameStarted;

  // Función para obtener el valor de la carta basado en el nombre del archivo
  const getCardValueFromFilename = (filename) => {
    const baseName = filename.replace('.png', '');
    const numero = baseName.slice(-2);
    
    const valorMap = {
      '01': 'A', '11': 'J', '12': 'Q', '13': 'K',
      '02': '2', '03': '3', '04': '4', '05': '5', '06': '6', '07': '7', '08': '8', '09': '9', '10': '10'
    };
    
    return valorMap[numero] || numero;
  };

  // Función para obtener el palo de la carta basado en el primer carácter
  const getSuitFromFilename = (filename) => {
    const firstChar = filename.charAt(0).toLowerCase();
    const suitMap = {
      'c': '♣', 'd': '♦', 'h': '♥', 's': '♠'
    };
    return suitMap[firstChar] || '♠';
  };

  // Crear baraja completa usando las imágenes reales
  const createDeck = () => {
    const cardFiles = [
      // Trebol (♣)
      'c01.png', 'c02.png', 'c03.png', 'c04.png', 'c05.png', 'c06.png', 'c07.png', 'c08.png', 'c09.png', 'c10.png', 'c11.png', 'c12.png', 'c13.png',
      // Diamantes (♦)
      'd01.png', 'd02.png', 'd03.png', 'd04.png', 'd05.png', 'd06.png', 'd07.png', 'd08.png', 'd09.png', 'd10.png', 'd11.png', 'd12.png', 'd13.png',
      // Corazones Rojos (♥)
      'h01.png', 'h02.png', 'h03.png', 'h04.png', 'h05.png', 'h06.png', 'h07.png', 'h08.png', 'h09.png', 'h10.png', 'h11.png', 'h12.png', 'h13.png',
      // Espadas (♠)
      's01.png', 's02.png', 's03.png', 's04.png', 's05.png', 's06.png', 's07.png', 's08.png', 's09.png', 's10.png', 's11.png', 's12.png', 's13.png'
    ];

    const newDeck = cardFiles.map(filename => {
      const value = getCardValueFromFilename(filename);
      const suit = getSuitFromFilename(filename);
      return {
        value,
        suit,
        id: `${value}-${suit}`,
        image: `/Cartas/${filename}`
      };
    });

    return newDeck;
  };

  // Simulación realista de barajado (como en casinos reales)
  const shuffleDeck = (cards) => {
    const shuffledDeck = [...cards];

    // Realizar múltiples iteraciones de barajado para mayor aleatoriedad
    for (let i = 0; i < 3; i++) {
      const cutPoint = Math.floor(Math.random() * shuffledDeck.length);
      const firstHalf = shuffledDeck.slice(0, cutPoint);
      const secondHalf = shuffledDeck.slice(cutPoint);
      const result = [];

      // Mezclar las dos mitades de manera más aleatoria
      while (firstHalf.length > 0 || secondHalf.length > 0) {
        if (Math.random() > 0.5 && firstHalf.length > 0) {
          result.push(firstHalf.shift());
        }
        if (Math.random() > 0.5 && secondHalf.length > 0) {
          result.push(secondHalf.shift());
        }
      }

      shuffledDeck.splice(0, shuffledDeck.length, ...result);
    }

    // Realizar un último barajado tipo Fisher-Yates
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }

    return shuffledDeck;
  };

  // Obtener valor numérico de la carta para determinar el grupo
  const getCardValue = (card) => {
    const valueMap = {
      'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
    };
    return valueMap[card.value];
  };

  // FUNCIONES DE DRAG & DROP
  const handleDragStart = (e, card, pileIndex) => {
    if (gameOver || !gameStarted || pileIndex !== activePile || autoPlaying) {
      e.preventDefault();
      return;
    }

    setDraggedCard(card);
    setDragSourcePile(pileIndex);
    setIsDragging(true);
    
    const cardValue = getCardValue(card);
    const validTarget = cardValue - 1;
    setValidDropTargets([validTarget]);
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ card, pileIndex }));
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    setDraggedCard(null);
    setDragSourcePile(null);
    setValidDropTargets([]);
  };

  const handleDragOver = (e, targetPileIndex) => {
    if (!isDragging || !draggedCard) return;
    
    const cardValue = getCardValue(draggedCard);
    const correctTarget = cardValue - 1;
    
    if (targetPileIndex === correctTarget) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e, targetPileIndex) => {
    e.preventDefault();
    
    if (!draggedCard || dragSourcePile === null) return;
    
    const cardValue = getCardValue(draggedCard);
    const correctTarget = cardValue - 1;
    
    if (targetPileIndex !== correctTarget) {
      setGameMessage('¡Debes arrastrar la carta a su grupo correcto!');
      return;
    }
    
    executeDragMove(dragSourcePile, targetPileIndex, draggedCard);
  };

  const executeDragMove = (sourcePileIndex, targetPileIndex, card) => {
    const newPiles = [...piles];
    
    const sourceCards = newPiles[sourcePileIndex].cards;
    const cardIndex = sourceCards.findIndex(c => c.id === card.id);
    if (cardIndex === -1) return;
    
    sourceCards.splice(cardIndex, 1);
    newPiles[targetPileIndex].revealedCards.push(card);
    
    setActivePile(targetPileIndex);
    setPiles(newPiles);
    setCurrentRevealedCard(null);
    
    const cardValue = getCardValue(card);
    setGameMessage(`Carta ${card.value}${card.suit} movida al grupo ${cardValue}`);
    
    // Verificar fin del juego
    setTimeout(() => {
      if (checkGameEnd(newPiles)) {
        setGameWon(true);
        setGameOver(true);
        setGameMessage('¡Felicitaciones! ¡Has ganado el juego! El Oráculo responde: SÍ');
      } else {
        const nextBlockCheck = checkBlockingRules(targetPileIndex, newPiles);
        if (nextBlockCheck.blocked) {
          setGameOver(true);
          setGameWon(false);
          setGameMessage(nextBlockCheck.message);
        }
      }
    }, 500);
  };

  // Inicializar el juego
  const initializeGame = () => {
    if (!canStartGame) return;

    const newDeck = createDeck();
    const shuffledDeck = shuffleDeck(newDeck);
    
    const newPiles = Array.from({ length: 13 }, (_, index) => {
      const pileCards = shuffledDeck.slice(index * 4, (index + 1) * 4);
      return {
        cards: pileCards,
        revealedCards: [],
        isEmpty: false
      };
    });
    
    setDeck(shuffledDeck);
    setPiles(newPiles);
    setActivePile(12);
    setGameStarted(true);
    setGameOver(false);
    setGameWon(false);
    setFirstClick(true);
    setIsShuffling(false);
    setCurrentRevealedCard(null);
    setGameMessage('¡Haz clic en la carta central (grupo 13) para revelarla, luego arrástrala a su grupo correcto!');
  };

  // Verificar si el juego ha terminado
  const checkGameEnd = (currentPiles) => {
    for (let i = 0; i < currentPiles.length; i++) {
      const pile = currentPiles[i];
      const expectedValue = i + 1;
      
      if (pile.revealedCards.length !== 4) {
        return false;
      }
      
      if (pile.cards.length > 0) {
        return false;
      }
      
      for (let card of pile.revealedCards) {
        if (getCardValue(card) !== expectedValue) {
          return false;
        }
      }
    }
    
    return true;
  };

  // Verificar reglas de bloqueo
  const checkBlockingRules = (pileIndex, currentPiles) => {
    const pile = currentPiles[pileIndex];
    
    if (pile.cards.length === 0) {
      return { blocked: true, message: '¡Has perdido! No hay más cartas en este grupo. El Oráculo responde: NO' };
    }
    
    if (pile.cards.length === 1) {
      const lastCard = pile.cards[0];
      const cardValue = getCardValue(lastCard);
      
      if (cardValue === pileIndex + 1) {
        return { blocked: true, message: '¡Has perdido! La última carta pertenece al mismo grupo. El Oráculo responde: NO' };
      }
    }
    
    return { blocked: false, message: '' };
  };

  // Revelar carta
  const revealCard = (pileIndex) => {
    if (gameOver || !gameStarted || pileIndex !== activePile || autoPlaying || currentRevealedCard) {
      if (pileIndex !== activePile && gameStarted && !gameOver && !autoPlaying) {
        setGameMessage('¡Debes hacer clic en el grupo activo!');
      }
      return;
    }

    if (firstClick && pileIndex !== 12) {
      setGameMessage('¡Debes empezar por la carta central (grupo 13)!');
      return;
    }

    if (firstClick) {
      setFirstClick(false);
    }

    const blockCheck = checkBlockingRules(pileIndex, piles);
    if (blockCheck.blocked) {
      setGameOver(true);
      setGameWon(false);
      setGameMessage(blockCheck.message);
      return;
    }

    const currentPile = piles[pileIndex];
    const cardToReveal = currentPile.cards[0];
    
    setCurrentRevealedCard(cardToReveal);
    setGameMessage(`Carta ${cardToReveal.value}${cardToReveal.suit} revelada. Arrástrala al grupo ${getCardValue(cardToReveal)}`);
  };

  // Función para ejecutar un movimiento automático
  const executeAutoMove = (currentPiles, currentActivePile, isFirstMove) => {
    const blockCheck = checkBlockingRules(currentActivePile, currentPiles);
    if (blockCheck.blocked) {
      return {
        newPiles: currentPiles,
        newActivePile: currentActivePile,
        gameEnded: true,
        won: false,
        message: blockCheck.message
      };
    }

    const newPiles = [...currentPiles];
    const currentPile = newPiles[currentActivePile];

    const flippedCard = currentPile.cards.shift();
    const cardValue = getCardValue(flippedCard);
    const destinationPileIndex = cardValue - 1;

    newPiles[destinationPileIndex].revealedCards.push(flippedCard);

    const hasWon = checkGameEnd(newPiles);
    if (hasWon) {
      return {
        newPiles,
        newActivePile: destinationPileIndex,
        gameEnded: true,
        won: true,
        message: '¡Felicitaciones! ¡Has ganado el juego! El Oráculo responde: SÍ',
        flippedCard
      };
    }

    const nextBlockCheck = checkBlockingRules(destinationPileIndex, newPiles);
    if (nextBlockCheck.blocked) {
      return {
        newPiles,
        newActivePile: destinationPileIndex,
        gameEnded: true,
        won: false,
        message: nextBlockCheck.message,
        flippedCard
      };
    }

    return {
      newPiles,
      newActivePile: destinationPileIndex,
      gameEnded: false,
      won: false,
      message: `Carta ${flippedCard.value}${flippedCard.suit} movida al grupo ${cardValue}`,
      flippedCard
    };
  };

  // Jugar automáticamente
  const autoPlay = async () => {
    if (!canStartGame) return;

    setAutoPlaying(true);

    const newDeck = createDeck();
    const shuffledDeck = shuffleDeck(newDeck);

    let currentPiles = Array.from({ length: 13 }, (_, index) => {
      const pileCards = shuffledDeck.slice(index * 4, (index + 1) * 4);
      return {
        cards: pileCards,
        revealedCards: [],
        isEmpty: false
      };
    });
    
    setDeck(shuffledDeck);
    setPiles(currentPiles);
    let currentActivePile = 12;
    setActivePile(currentActivePile);
    setGameStarted(true);
    setGameOver(false);
    setGameWon(false);
    setIsShuffling(false);
    setCurrentRevealedCard(null);
    setGameMessage('🤖 Juego automático iniciado...');

    setTimeout(() => {
      let moveCount = 0;
      let isFirstMove = true;
      
      const playAutomatically = () => {
        if (moveCount >= 200) {
          setGameOver(true);
          setGameWon(false);
          setGameMessage('Juego automático detenido - límite de movimientos alcanzado. El Oráculo responde: NO');
          setAutoPlaying(false);
          return;
        }

        const result = executeAutoMove(currentPiles, currentActivePile, isFirstMove);
        
        currentPiles = result.newPiles;
        currentActivePile = result.newActivePile;
        setPiles(result.newPiles);
        setActivePile(result.newActivePile);
        setGameMessage(result.message);
        
        moveCount++;
        isFirstMove = false;

        if (result.gameEnded) {
          setGameOver(true);
          setGameWon(result.won);
          setAutoPlaying(false);
        } else {
          setTimeout(playAutomatically, 600);
        }
      };

      playAutomatically();
    }, 1000);
  };

  // Reiniciar el juego
  const restartGame = () => {
    setQuestion('');
    setDeck([]);
    setPiles([]);
    setActivePile(null);
    setGameStarted(false);
    setGameOver(false);
    setGameWon(false);
    setGameMessage('');
    setIsShuffling(false);
    setAutoPlaying(false);
    setFirstClick(true);
    setCurrentRevealedCard(null);
    setDraggedCard(null);
    setDragSourcePile(null);
    setIsDragging(false);
    setValidDropTargets([]);
  };

  // Mapeo de posiciones para la cruz
  const getCardPosition = (index) => {
    const positions = [
      { gridColumn: 2, gridRow: 1 }, { gridColumn: 3, gridRow: 1 }, { gridColumn: 4, gridRow: 1 },
      { gridColumn: 5, gridRow: 2 }, { gridColumn: 5, gridRow: 3 }, { gridColumn: 5, gridRow: 4 },
      { gridColumn: 4, gridRow: 5 }, { gridColumn: 3, gridRow: 5 }, { gridColumn: 2, gridRow: 5 },
      { gridColumn: 1, gridRow: 4 }, { gridColumn: 1, gridRow: 3 }, { gridColumn: 1, gridRow: 2 },
      { gridColumn: 3, gridRow: 3 }
    ];
    return positions[index] || { gridColumn: 1, gridRow: 1 };
  };

  // Función para manejar la finalización de la animación de barajado
  const handleShuffleComplete = () => {
    setShowShuffle(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: "url('/Cartas/casino.png') no-repeat center center fixed",
      backgroundSize: 'cover',
      fontFamily: 'Arial, sans-serif',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{
        display: 'flex',
        minHeight: 'calc(100vh - 40px)',
        gap: '40px',
        alignItems: 'flex-start'
      }}>
        
        {/* Panel izquierdo - Controles */}
        <div style={{
          flex: '0 0 350px',
          display: 'flex',
          flexDirection: 'column',
          gap: '30px'
        }}>
          
          <h1 style={{
            textAlign: 'left',
            fontSize: '2.5rem',
            marginBottom: '0',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Oráculo de la Suerte
          </h1>
          
          <div>
            <input 
              type="text" 
              style={{
                width: '100%',
                padding: '15px 20px',
                fontSize: '1.1rem',
                border: 'none',
                borderRadius: '25px',
                textAlign: 'left',
                outline: 'none',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                color: '#000'
              }}
              placeholder="Escribe tu pregunta mágica aquí"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={gameStarted}
              required
            />
          </div>
          
          {gameMessage && (
            <div style={{
              background: gameWon ? 'rgba(46, 125, 50, 0.9)' : gameOver ? 'rgba(211, 47, 47, 0.9)' : 'rgba(2, 136, 209, 0.9)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              textAlign: 'left',
              padding: '15px 20px',
              borderRadius: '15px',
              fontSize: '1rem',
              fontWeight: 'bold',
            }}>
              {gameMessage}
            </div>
          )}
          
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            padding: '25px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h3 style={{ 
              margin: '0 0 25px 0', 
              textAlign: 'left',
              fontSize: '1.3rem'
            }}>
              🎮 Controles de Juego
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Botón fijo para instalación de la PWA */}
              <InstallPWAButton />

              <button 
                style={{
                  width: '100%',
                  padding: '15px',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: canShuffle ? 'pointer' : 'not-allowed',
                  background: canShuffle ? 'linear-gradient(145deg, #007bff, #0056b3)' : 'linear-gradient(145deg, #6c757d, #adb5bd)',
                  color: 'white',
                  opacity: canShuffle ? 1 : 0.6,
                  transition: 'all 0.3s ease'
                }}
                onClick={() => {
                  if (canShuffle) {
                    setShowShuffle(true);
                    setTimeout(() => setShowShuffle(false), 15000);
                  }
                }}
                disabled={!canShuffle}
              >
                Barajar
              </button>
              
              <button 
                style={{
                  width: '100%',
                  padding: '15px',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: canStartGame ? 'pointer' : 'not-allowed',
                  background: canStartGame ? 'linear-gradient(145deg, #28a745, #20c997)' : 'linear-gradient(145deg, #6c757d, #adb5bd)',
                  color: 'white',
                  opacity: canStartGame ? 1 : 0.6,
                  transition: 'all 0.3s ease'
                }}
                onClick={initializeGame}
                disabled={!canStartGame || isShuffling || autoPlaying}
              >
                {isShuffling ? 'Barajando...' : 'Iniciar Juego'}
              </button>
              
              <button 
                style={{
                  width: '100%',
                  padding: '15px',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: canStartGame ? 'pointer' : 'not-allowed',
                  background: canStartGame ? 'linear-gradient(145deg, #6f42c1, #e83e8c)' : 'linear-gradient(145deg, #6c757d, #adb5bd)',
                  color: 'white',
                  opacity: canStartGame ? 1 : 0.6,
                  transition: 'all 0.3s ease'
                }}
                onClick={autoPlay}
                disabled={!canStartGame || isShuffling || autoPlaying}
              >
                {autoPlaying ? 'Jugando automáticamente...' : 'Jugar Automáticamente'}
              </button>
              
              <button 
                style={{
                  width: '100%',
                  padding: '15px',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  background: 'linear-gradient(145deg, #fd7e14, #ffc107)',
                  color: 'white',
                  transition: 'all 0.3s ease'
                }}
                onClick={restartGame}
                disabled={isShuffling || autoPlaying}
              >
                🔄 Nuevo Juego
              </button>
            </div>
            
            {gameStarted && (
              <div style={{ 
                marginTop: '25px', 
                fontSize: '0.95rem',
                background: 'rgba(255,255,255,0.1)',
                padding: '15px',
                borderRadius: '12px',
                textAlign: 'left'
              }}>
                <p style={{ margin: '0 0 8px 0' }}><strong>Tu pregunta:</strong></p>
                <p style={{ margin: '0 0 12px 0', fontStyle: 'none' }}>"{question}"</p>
                <p style={{ margin: '0 0 8px 0' }}><strong>Grupo activo:</strong> {activePile !== null ? activePile + 1 : 'Ninguno'}</p>
                {autoPlaying && <p style={{ margin: '0', color: '#ffffffff' }}><strong>Estado:</strong> Jugando automáticamente</p>}
              </div>
            )}
          </div>
        </div>
        
        {/* Panel derecho - Juego */}
        <div style={{
          flex: '1',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '600px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 110px)',
            gridTemplateRows: 'repeat(5, 140px)',
            gap: '50px',
            padding: '70px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '25px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
          }}>
            {Array.from({ length: 13 }, (_, index) => {
              const position = getCardPosition(index);
              const pile = piles[index];
              const isActive = index === activePile;
              const displayNumber = index + 1;
              const hasCards = pile && pile.cards.length > 0;
              const topCard = hasCards ? pile.cards[0] : null;
              const revealedCount = pile ? pile.revealedCards.length : 0;
              const isValidDropTarget = validDropTargets.includes(index);
              const shouldShowRevealedCard = currentRevealedCard && dragSourcePile === index;
              
              return (
                <div
                  key={index}
                  style={{
                    gridColumn: position.gridColumn,
                    gridRow: position.gridRow,
                    width: '107px',
                    height: '140px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: isActive ? '3px solid #FFD700' : 
                           isValidDropTarget ? '3px solid #4CAF50' : 
                           '2px solid rgba(255,255,255,0.2)',
                    background: !hasCards 
                      ? 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))' 
                      : isValidDropTarget 
                        ? 'linear-gradient(145deg, rgba(76,175,80,0.3), rgba(76,175,80,0.1))'
                        : 'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))',
                    boxShadow: isActive 
                      ? '0 0 25px rgba(255,215,0,0.6), 0 8px 20px rgba(0,0,0,0.2)' 
                      : isValidDropTarget
                        ? '0 0 25px rgba(76,175,80,0.6), 0 8px 20px rgba(0,0,0,0.2)'
                        : '0 6px 15px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                    opacity: autoPlaying ? 0.8 : 1
                  }}
                  onClick={() => revealCard(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    width: '100%', 
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}>
                    <span>{displayNumber}</span>
                    {isValidDropTarget && <span style={{ color: '#4CAF50' }}>📍</span>}
                  </div>
                  
                  {gameStarted && topCard ? (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      flex: 1,
                      justifyContent: 'center'
                    }}>
                      <img 
                        src={shouldShowRevealedCard ? currentRevealedCard.image : 
                             (index !== activePile ? '/Cartas/ParteTrasera.png' : topCard.image)} 
                        alt="Carta"
                        style={{
                          width: '90px',
                          height: '125px',
                          objectFit: 'contain',
                          borderRadius: '6px',
                          background: 'white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          cursor: (shouldShowRevealedCard || (isActive && !currentRevealedCard)) ? 'grab' : 'pointer'
                        }}
                        draggable={shouldShowRevealedCard || (isActive && !currentRevealedCard && !autoPlaying)}
                        onDragStart={(e) => {
                          const cardToDrag = shouldShowRevealedCard ? currentRevealedCard : topCard;
                          handleDragStart(e, cardToDrag, index);
                        }}
                        onDragEnd={handleDragEnd}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div style={{ 
                        display: 'none', 
                        textAlign: 'center',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: 'white',
                        color: '#333',
                        padding: '10px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                          {shouldShowRevealedCard ? currentRevealedCard.value : topCard.value}
                        </div>
                        <div style={{ fontSize: '1.3rem' }}>
                          {shouldShowRevealedCard ? currentRevealedCard.suit : topCard.suit}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      flex: 1, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      textAlign: 'center',
                      fontWeight: '500'
                    }}>
                      <span>Grupo {displayNumber}</span>
                    </div>
                  )}
                  
                  {revealedCount > 0 && (
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#ffffffff', 
                      fontWeight: 'bold',
                      background: 'rgba(76, 175, 80, 0.2)',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      ✓ {revealedCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Overlay de barajado */}
      {showShuffle && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <ShuffleAnimation onAnimationComplete={handleShuffleComplete} />
        </div>
      )}
    </div>
  );
};

export default App;