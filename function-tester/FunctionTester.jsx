import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';


export function FunctionTester({ fn, input, output, tests, onFinish }) {

  const [manualTests, setManualTests] = useState([]);
  const [currentTestIndex, setCurrentTestIndex] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [errors, setErrors] = useState([]);

  const handleRunTest = (test, index) => {
    if (testResults[index] === true) {
      return;
    }
    const result = test.testFn(fn);
    setTestResults((prevResults) => ({
      ...prevResults,
      [index]: result,
    }));
    if (result) {
      setTotalPoints((prevPoints) => prevPoints + test.points);
    }
  };

  const handleRunAllTests = () => {
    tests.concat(manualTests).forEach(handleRunTest);
  };

  const handleAddManualTest = () => {
    setManualTests((prevTests) => [
      ...prevTests,
      {
        name: '',
        testFn: () => false,
        points: 0,
      },
    ]);
    setCurrentTestIndex(manualTests.length);
  };

  const handleUpdateManualTest = (index, updatedTest) => {
    setManualTests((prevTests) =>
      prevTests.map((test, i) => (i === index ? updatedTest : test))
    );
  };

  const handleDeleteManualTest = (index) => {
    setManualTests((prevTests) => prevTests.filter((_, i) => i !== index));
    setCurrentTestIndex(null);
  };

  const handleFinish = () => {
    onFinish({
      tests: tests.concat(manualTests),
      testResults,
      totalPoints,
    });
  };

  const renderInputField = (inputType, value, onChange) => {
    if (typeof inputType === 'string') {
      switch (inputType) {
        case 'string':
          return (
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            />
          );
        case 'number':
          return (
            <input
              type="number"
              value={value || ''}
              onChange={(e) => onChange(parseInt(e.target.value))}
            />
          );
        case 'boolean':
          return (
            <>
              <input
                type="radio"
                id="true"
                name="boolean"
                value="true"
                checked={value === true}
                onChange={() => onChange(true)}
              />
              <label htmlFor="true">True</label>
              <input
                type="radio"
                id="false"
                name="boolean"
                value="false"
                checked={value === false}
                onChange={() => onChange(false)}
              />
              <label htmlFor="false">False</label>
            </>
          );
        default:
          return null;
      }
    } else if (Array.isArray(inputType)) {
      return (
        <>
          {value &&
            value.map((item, index) => (
              <div key={index} style={{ marginLeft: '20px' }}>
                {renderInputField(inputType[0], item, (updatedItem) =>
                  onChange(
                    value.map((v, i) => (i === index ? updatedItem : v))
                  )
                )}
                <button onClick={() =>
                  onChange(value.filter((_, i) => i !== index))
                }>
                  Delete
                </button>
              </div>
            ))}
          <button onClick={() =>
            onChange([...(value || []), getDefaultInputValue(inputType[0])])
          }>
            Add Item
          </button>
        </>
      );
    } else if (typeof inputType === 'object') {
      return (
        <>
          {Object.entries(inputType).map(([key, type]) => (
            <div key={key} style={{ marginLeft: '20px' }}>
              <strong>{key}</strong>
              {renderInputField(type, value?.[key], (updatedValue) =>
                onChange({ ...value, [key]: updatedValue })
              )}
            </div>
          ))}
        </>
      );
    }
  };

  const getDefaultInputValue = (inputType) => {
    if (typeof inputType === 'string') {
      switch (inputType) {
        case 'string':
          return '';
        case 'number':
          return 0;
        case 'boolean':
          return false;
        default:
          return null;
      }
    } else if (Array.isArray(inputType)) {
      return [];
    } else if (typeof inputType === 'object') {
      return Object.fromEntries(
        Object.entries(inputType).map(([key, type]) => [
          key,
          getDefaultInputValue(type),
        ])
      );
    }
  };

  const validateInputValue = (inputType, value) => {
    if (typeof inputType === 'string') {
      switch (inputType) {
        case 'string':
          return typeof value === 'string';
        case 'number':
          return typeof value === 'number';
        case 'boolean':
          return typeof value === 'boolean';
        default:
          return false;
      }
    } else if (Array.isArray(inputType)) {
      return (
        Array.isArray(value) &&
        value.every((item) => validateInputValue(inputType[0], item))
      );
    } else if (typeof inputType === 'object') {
      return (
        typeof value === 'object' &&
        Object.entries(inputType).every(
          ([key, type]) => validateInputValue(type, value[key])
        )
      );
    }
  };

  const handleValidateManualTest = (index) => {
    const test = manualTests[index];
    const errors = [];
    if (!test.name) {
      errors.push('Test name is required');
    }
    if (!validateInputValue(input, test.input)) {
      errors.push('Invalid input value');
    }
    setErrors(errors);
  };

  const handleFocusError = (errorIndex) => {
    const error = errors[errorIndex];
    if (error === 'Test name is required') {
      document.getElementById('name').focus();
    } else if (error === 'Invalid input value') {
      document.getElementById('input').focus();
    }
  };


  
  console.log(fn);
  console.log(input);
  console.log(output);
  console.log(tests);
  return (
    <div className="container">
      <h2>Function Code</h2>
      <pre>{fn.toString()}</pre>
      <h2>Predefined Tests</h2>
      <ul className="list-group"> 
        {tests.map((test, index) => (
          <li key={index} className="list-group-item">
            <strong>{test.name}</strong>
            <button className="btn btn-primary" onClick={() => handleRunTest(test, index)}>Run Test</button>
            {testResults[index] !== undefined && (
              <span className={`badge bg-${testResults[index] ? 'success' : 'danger'}`}>
                {testResults[index] ? 'Pass' : 'Fail'}
              </span>
            )}
          </li>
        ))}
      </ul>
      <h2>Manual Tests</h2>
      <ul>
        {manualTests.map((test, index) => (
          <li key={index}>
            <strong>{test.name}</strong>
            <button onClick={() => handleRunTest(test, index + tests.length)}>
              Run Test
            </button>
            {testResults[index + tests.length] !== undefined && (
              <span>{testResults[index + tests.length] ? 'Pass' : 'Fail'}</span>
            )}
            <button onClick={() => setCurrentTestIndex(index)}>Edit</button>
            <button onClick={() => handleDeleteManualTest(index)}>Delete</button>
          </li>
        ))}
      </ul>
      {currentTestIndex !== null && (
        <>
          <h3>Edit Manual Test</h3>
          <label htmlFor="name">Name:</label><br/>
          <input
            type="text"
            id="name"
            value={manualTests[currentTestIndex].name}
            onChange={(e) =>
              handleUpdateManualTest(currentTestIndex, {
                ...manualTests[currentTestIndex],
                name: e.target.value,
              })
            }
          /><br/>
          <label htmlFor="points">Points:</label><br/>
          <input
            type="number"
            id="points"
            value={manualTests[currentTestIndex].points}
            onChange={(e) =>
              handleUpdateManualTest(currentTestIndex, {
                ...manualTests[currentTestIndex],
                points: parseInt(e.target.value),
              })
            }
          /><br/>
          <label htmlFor="input">Input:</label><br/>
          <div id="input" style={{ marginLeft: '20px' }}>
            {renderInputField(
              input,
              manualTests[currentTestIndex].input,
              (updatedInput) =>
                handleUpdateManualTest(currentTestIndex, {
                  ...manualTests[currentTestIndex],
                  input: updatedInput  })
                  )}
                </div>
                <label htmlFor="output">Output:</label><br/>
                <input
                  type="text"
                  id="output"
                  value={manualTests[currentTestIndex].output || ''}
                  onChange={(e) =>
                    handleUpdateManualTest(currentTestIndex, {
                      ...manualTests[currentTestIndex],
                      output: e.target.value,
                    })
                  }
                /><br/>
                <button onClick={() => handleValidateManualTest(currentTestIndex)}>
                  Validate
                </button>
                {errors.length > 0 && (
                  <>
                    <h4>Errors</h4>
                    <ul>
                      {errors.map((error, index) => (
                        <li key={index}>
                          {error}
                          <button onClick={() => handleFocusError(index)}>Focus</button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
            <button onClick={handleAddManualTest}>Add Manual Test</button><br/>
            <button onClick={handleRunAllTests}>Run All Tests</button><br/>
            <h2>Total Points: {totalPoints}</h2>
            <button onClick={handleFinish}>OK</button>
          </div>
 


    /*
    <>
      <h1>FunctionTester</h1>
      <button
        onClick={() =>
          onFinish({
            givenTests: [],
            testResult: { achieved: 100, all: 100 },
            customTests: [],
          })
        }
      >
        OK
      </button>
    </>
    */
  );
}
export default FunctionTester;