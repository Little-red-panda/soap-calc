import React, { useState, useMemo } from 'react';
import { oils, superfatOils, SelectedOil } from './types';
import styles from './styles';
type SoapMethod = 'cold' | 'hot';

interface SoapState {
  selectedOils: SelectedOil[];
  superfatOils: SelectedOil[];
  superfat: string;
  result: number | null;
  showSuperfat: boolean;
}

function App() {
  const [currentOil, setCurrentOil] = useState(oils[0]);
  const [currentSuperfatOil, setCurrentSuperfatOil] = useState(superfatOils[0]);
  const [currentWeight, setCurrentWeight] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingWeight, setEditingWeight] = useState('');
  const [soapMethod, setSoapMethod] = useState<SoapMethod>('cold');
  
  const [coldState, setColdState] = useState<SoapState>({
    selectedOils: [],
    superfatOils: [],
    superfat: '3',
    result: null,
    showSuperfat: false
  });

  const [hotState, setHotState] = useState<SoapState>({
    selectedOils: [],
    superfatOils: [],
    superfat: '0',
    result: null,
    showSuperfat: false
  });

  const [superfatPercentages, setSuperfatPercentages] = useState<{[key: string]: number}>({});
  const [fixedOils, setFixedOils] = useState<string[]>([]);

  const currentState = soapMethod === 'cold' ? coldState : hotState;
  const setCurrentState = soapMethod === 'cold' ? setColdState : setHotState;

  const handleAddOil = () => {
    const weight = parseFloat(currentWeight);
    if (!isNaN(weight) && weight > 0) {
      if (currentState.selectedOils.some(oil => oil.name === currentOil.name)) {
        setError(`Масло "${currentOil.name}" уже добавлено в список`);
        return;
      }
      setCurrentState({
        ...currentState,
        selectedOils: [...currentState.selectedOils, { ...currentOil, weight }]
      });
      setCurrentWeight('');
      setError(null);
    }
  };

  const handleAddSuperfatOil = () => {
    if (currentState.superfatOils.some(oil => oil.name === currentSuperfatOil.name)) {
      setError(`Масло "${currentSuperfatOil.name}" уже добавлено в список пережира`);
      return;
    }

    const newOils = [...currentState.superfatOils, { ...currentSuperfatOil, weight: 0 }];
    setCurrentState({
      ...currentState,
      superfatOils: newOils
    });

    // Перераспределяем проценты
    const newPercentages = { ...superfatPercentages };
    
    // Считаем сумму зафиксированных процентов
    const totalFixedPercentage = fixedOils.reduce((sum, name) => sum + (newPercentages[name] || 0), 0);
    
    // Оставшийся процент распределяем между незафиксированными маслами
    const remainingPercentage = 100 - totalFixedPercentage;
    const unfixedOils = newOils.filter(oil => !fixedOils.includes(oil.name));
    
    if (unfixedOils.length > 0) {
      const equalShare = remainingPercentage / unfixedOils.length;
      unfixedOils.forEach(oil => {
        newPercentages[oil.name] = equalShare;
      });
    }

    setSuperfatPercentages(newPercentages);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!currentState.showSuperfat) {
        handleAddOil();
      } else {
        handleAddSuperfatOil();
      }
    }
  };

  const handleRemoveOil = (index: number) => {
    const newOils = [...currentState.selectedOils];
    newOils.splice(index, 1);
    setCurrentState({
      ...currentState,
      selectedOils: newOils
    });
  };

  const handleRemoveSuperfatOil = (index: number) => {
    const oilToRemove = currentState.superfatOils[index];
    const remainingOils = currentState.superfatOils.filter((_, i) => i !== index);
    
    setCurrentState({
      ...currentState,
      superfatOils: remainingOils
    });

    // Удаляем масло из зафиксированных
    setFixedOils(prev => prev.filter(name => name !== oilToRemove.name));

    // Перераспределяем проценты
    const newPercentages = { ...superfatPercentages };
    delete newPercentages[oilToRemove.name];

    // Считаем сумму зафиксированных процентов
    const totalFixedPercentage = fixedOils
      .filter(name => name !== oilToRemove.name) // Исключаем удаленное масло
      .reduce((sum, name) => sum + (newPercentages[name] || 0), 0);
    
    // Оставшийся процент распределяем между незафиксированными маслами
    const remainingPercentage = 100 - totalFixedPercentage;
    const unfixedOils = remainingOils.filter(oil => !fixedOils.includes(oil.name));
    
    if (unfixedOils.length > 0) {
      const equalShare = remainingPercentage / unfixedOils.length;
      unfixedOils.forEach(oil => {
        newPercentages[oil.name] = equalShare;
      });
    }

    setSuperfatPercentages(newPercentages);
    setError(null);
  };

  const handleEditWeight = (index: number) => {
    setEditingIndex(index);
    setEditingWeight(currentState.selectedOils[index].weight.toString());
  };

  const handleSaveWeight = (index: number) => {
    const weight = parseFloat(editingWeight);
    if (!isNaN(weight) && weight > 0) {
      const newOils = [...currentState.selectedOils];
      newOils[index] = { ...newOils[index], weight };
      setCurrentState({
        ...currentState,
        selectedOils: newOils
      });
      setEditingIndex(null);
    }
  };

  const totalWeight = currentState.selectedOils.reduce((sum, oil) => sum + oil.weight, 0);
  const totalNaOH = currentState.selectedOils.reduce((sum, oil) => sum + (oil.weight * oil.sap), 0);
  const superfatPercent = parseFloat(currentState.superfat) || 0;
  const adjustedNaOH = soapMethod === 'cold'
    ? totalNaOH * (1 - superfatPercent / 100)
    : totalNaOH;
  const waterAmount = adjustedNaOH * 2.3;

  // Расчет необходимого количества масел для пережира при горячем способе
  const superfatWeight = soapMethod === 'hot' ? (totalWeight * superfatPercent / 100) : 0;
  const superfatWeightPerOil = currentState.superfatOils.length > 0 ? superfatWeight / currentState.superfatOils.length : 0;

  const handlePercentageChange = (oilName: string, newPercentage: number) => {
    const newPercentages = { ...superfatPercentages };
    newPercentages[oilName] = newPercentage;

    // Если масло не зафиксировано, фиксируем его
    if (!fixedOils.includes(oilName)) {
      setFixedOils(prev => [...prev, oilName]);
    }

    // Проверяем сумму зафиксированных процентов
    const totalFixedPercentage = fixedOils.reduce((sum, name) => {
      // Используем новое значение для текущего масла
      const percentage = name === oilName ? newPercentage : (newPercentages[name] || 0);
      return sum + percentage;
    }, 0);

    if (totalFixedPercentage > 100) {
      setError(`Сумма зафиксированных процентов (${totalFixedPercentage.toFixed(1)}%) превышает 100%`);
      return;
    }

    // Перераспределяем оставшиеся проценты между незафиксированными маслами
    const remainingOils = currentState.superfatOils.filter(oil => 
      !fixedOils.includes(oil.name) || oil.name === oilName
    );
    
    const remainingPercentage = 100 - totalFixedPercentage;
    
    if (remainingOils.length > 1) {
      const equalShare = remainingPercentage / (remainingOils.length - 1);
      remainingOils.forEach(oil => {
        if (oil.name !== oilName) {
          newPercentages[oil.name] = equalShare;
        }
      });
    }

    setSuperfatPercentages(newPercentages);
    setError(null);
  };

  const totalSuperfatPercentage = useMemo(() => {
    return Object.values(superfatPercentages).reduce((sum, val) => sum + val, 0);
  }, [superfatPercentages, currentState.superfatOils]);

  const handleUnfixPercentage = (oilName: string) => {
    // Убираем масло из зафиксированных
    setFixedOils(prev => prev.filter(name => name !== oilName));

    // Перераспределяем проценты
    const newPercentages = { ...superfatPercentages };
    
    // Считаем сумму процентов зафиксированных масел
    const fixedOilsSum = fixedOils
      .filter(name => name !== oilName) // Исключаем текущее масло
      .reduce((sum, name) => sum + (newPercentages[name] || 0), 0);
    
    // Оставшийся процент распределяем между незафиксированными маслами
    const remainingPercentage = 100 - fixedOilsSum;
    const unfixedOils = currentState.superfatOils.filter(oil => 
      !fixedOils.includes(oil.name) || oil.name === oilName
    );
    
    if (unfixedOils.length > 0) {
      const equalShare = remainingPercentage / unfixedOils.length;
      unfixedOils.forEach(oil => {
        newPercentages[oil.name] = equalShare;
      });
    }

    setSuperfatPercentages(newPercentages);
  };

  const superfatWeights = useMemo(() => {
    const weights: {[key: string]: number} = {};
    currentState.superfatOils.forEach(oil => {
      const percentage = superfatPercentages[oil.name] || 0;
      weights[oil.name] = superfatWeight * (percentage / 100);
    });
    return weights;
  }, [superfatWeight, superfatPercentages, currentState.superfatOils]);

  const { Container, HeaderContainer, HeaderInputsWrap, OilContainer } = styles;

  return (
    <Container>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Калькулятор SAP</h1>
      <HeaderContainer>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
          gap: '10px',
        }}>
          <button
            onClick={() => {
              setSoapMethod('cold');
              setError(null);
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: soapMethod === 'cold' ? '#2196F3' : '#e0e0e0',
              color: soapMethod === 'cold' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Холодный способ
          </button>
          <button
            onClick={() => {
              setSoapMethod('hot');
              setError(null);
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: soapMethod === 'hot' ? '#2196F3' : '#e0e0e0',
              color: soapMethod === 'hot' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Горячий способ
          </button>
        </div>

        <h3 style={{ marginBottom: '10px' }}>Добавить масло:</h3>

        <HeaderInputsWrap>
          <select
            value={currentOil.name}
            onChange={(e) => {
              const oil = oils.find(o => o.name === e.target.value);
              if (oil) {
                setCurrentOil(oil);
                setError(null);
              }
            }}
            style={{
              flex: 2,
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              maxWidth: '100%'
            }}
          >
            {oils.map((oil) => (
              <option key={oil.name} value={oil.name}>
                {oil.name} (SAP: {oil.sap})
              </option>
            ))}
          </select>
          <input
            type="number"
            value={currentWeight}
            onChange={(e) => {
              setCurrentWeight(e.target.value);
              setError(null);
            }}
            onKeyPress={handleKeyPress}
            placeholder="Вес (г)"
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
          <button
            onClick={handleAddOil}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Добавить
          </button>
        </HeaderInputsWrap>
        {error && (
          <div style={{
            padding: '10px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            marginTop: '10px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        {soapMethod === 'cold' && (
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '10px'
          }}>
            <label style={{ whiteSpace: 'nowrap' }}>Пережир:</label>
            <input
              type="number"
              value={currentState.superfat}
              onChange={(e) => setCurrentState({
                ...currentState,
                superfat: e.target.value
              })}
              min="0"
              max="100"
              style={{
                width: '80px',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
            <span>%</span>
            <span style={{ color: '#666', fontSize: '14px' }}>
              (уменьшает количество NaOH)
            </span>
          </div>
        )}
      </HeaderContainer>

      {currentState.selectedOils.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Основные масла:</h3>
          <div style={{ 
            backgroundColor: '#fff',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}>
            {currentState.selectedOils.map((oil, index) => (
              <OilContainer key={index} style={{
                borderBottom: index < currentState.selectedOils.length - 1 ? '1px solid #ddd' : 'none',
              }}>
                <div style={{ flex: 1 }}>
                  <strong>{oil.name}</strong>
                  {editingIndex === index ? (
                    <div style={{ 
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px',
                      marginTop: '5px',
                      alignItems: 'center'
                    }}>
                      <input
                        type="number"
                        value={editingWeight}
                        onChange={(e) => setEditingWeight(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveWeight(index);
                          }
                        }}
                        style={{
                          width: '100px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid #ccc'
                        }}
                      />
                      <div>
                        <button
                          onClick={() => handleSaveWeight(index)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '10px'
                          }}
                        >
                          Сохранить
                        </button>
                        <button
                          onClick={() => setEditingIndex(null)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#9e9e9e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px',
                      marginTop: '5px',
                      alignItems: 'center'
                    }}>
                      <div style={{ color: '#666' }}>
                        {oil.weight}г × {oil.sap} = {(oil.weight * oil.sap).toFixed(2)}г NaOH
                      </div>
                      <button
                        onClick={() => handleEditWeight(index)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Изменить вес
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveOil(index)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginLeft: '10px'
                  }}
                >
                  Удалить
                </button>
              </OilContainer>
            ))}
          </div>
        </div>
      )}

      {currentState.selectedOils.length > 0 && (
        <div style={{ 
          padding: '20px',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <h3>Результат:</h3>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            margin: '20px 0'
          }}>
            <div style={{ 
              padding: '15px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>NaOH</h4>
              <p style={{ fontSize: '20px', margin: '0', color: '#2196F3' }}>
                {adjustedNaOH.toFixed(2)} г
              </p>
              <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
                {soapMethod === 'cold' 
                  ? `(с учетом пережира ${currentState.superfat}%)`
                  : '(полное количество для горячего способа)'}
              </p>
            </div>
            <div style={{ 
              padding: '15px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Вода</h4>
              <p style={{ fontSize: '20px', margin: '0', color: '#2196F3' }}>
                {waterAmount.toFixed(2)} г
              </p>
            </div>
          </div>
          <p style={{ color: '#666' }}>
            Общий вес масел: {totalWeight.toFixed(1)} г
          </p>
          {soapMethod === 'hot' && !currentState.showSuperfat && (
            <button
              onClick={() => setCurrentState({
                ...currentState,
                showSuperfat: true
              })}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Рассчитать масла для пережира
            </button>
          )}
        </div>
      )}

      {currentState.showSuperfat && (
        <>
          <div style={{ 
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 20px 0' }}>Добавить масло для пережира:</h3>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0 }}>Пережир:</h3>
              <input
                type="number"
                value={currentState.superfat}
                onChange={(e) => setCurrentState({
                  ...currentState,
                  superfat: e.target.value
                })}
                min="0"
                max="100"
                style={{
                  width: '80px',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
              <span>%</span>
              <span style={{ color: '#666', fontSize: '14px' }}>
                (добавляется на этапе загустения)
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <select
                value={currentSuperfatOil.name}
                onChange={(e) => {
                  const oil = superfatOils.find(o => o.name === e.target.value);
                  if (oil) {
                    setCurrentSuperfatOil(oil);
                    setError(null);
                  }
                }}
                style={{
                  flex: 2,
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  maxWidth: '100%'
                }}
              >
                {superfatOils.map((oil) => (
                  <option key={oil.name} value={oil.name}>
                    {oil.name} (SAP: {oil.sap})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddSuperfatOil}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Добавить для пережира
              </button>
            </div>
          </div>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '15px',
              color: '#333'
            }}>Масла для пережира</h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {currentState.superfatOils.map((oil, index) => (
                <div key={index} style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '20px 10px 10px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  position: 'relative'
                }}>
                  <span style={{
                    width: '150px',
                    fontWeight: '500',
                    color: '#333'
                  }}>{oil.name}</span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <input
                      type="number"
                      value={superfatPercentages[oil.name] || 0}
                      onChange={(e) => handlePercentageChange(oil.name, parseFloat(e.target.value) || 0)}
                      style={{
                        width: '70px',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                      step="0.1"
                    />
                    <span style={{ color: '#666' }}>%</span>
                  </div>
                  {fixedOils.includes(oil.name) && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginLeft: '10px'
                    }}>
                      <span style={{
                        fontSize: '13px',
                        color: '#666',
                        backgroundColor: '#e9ecef',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}>Зафиксирован %</span>
                      <button
                        onClick={() => handleUnfixPercentage(oil.name)}
                        style={{
                          fontSize: '13px',
                          color: '#dc3545',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fff5f5'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        убрать фиксацию
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveSuperfatOil(index)}
                    style={{
                      position: 'absolute',
                      right: '5px',
                      top: '5px',
                      color: '#dc3545',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontSize: '16px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fff5f5'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div style={{ 
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#e8f5e9',
            borderRadius: '4px'
          }}>
            <div>
              <strong>Общий вес масел для пережира:</strong> {superfatWeight.toFixed(1)}г
            </div>
            <div style={{ marginTop: '10px' }}>
              {currentState.superfatOils.map((oil, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '5px',
                  fontSize: '14px'
                }}>
                  <span>{oil.name}:</span>
                  <span>
                    {superfatWeights[oil.name].toFixed(1)}г 
                    ({superfatPercentages[oil.name].toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '5px', color: '#666' }}>
              Сумма процентов: {totalSuperfatPercentage.toFixed(1)}%
            </div>
          </div>
        </>
      )}
    </Container>
  );
}

export default App;
