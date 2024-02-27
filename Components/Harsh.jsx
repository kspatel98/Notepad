import React, { useState } from 'react';

const DescriptionInput = () => {
  const [lines, setLines] = useState([{ text: '', sublines: [] }]);
  const [currentIndex, setCurrentIndex] = useState(1);

  const handleInputChange = (event, mainIndex, subIndex) => {
    const newLines = [...lines];

    if (subIndex !== undefined) {
      newLines[mainIndex - 1].sublines[subIndex - 1] = event.target.value;
    } else {
      newLines[mainIndex - 1].text = event.target.value;
    }

    setLines(newLines);
  };

  const handleEnterPress = (mainIndex) => {
    const newLines = [...lines, { text: '', sublines: [] }];
    setLines(newLines);
    setCurrentIndex(currentIndex + 1);
  };

  const handleTabPress = (event, mainIndex, subIndex) => {
    event.preventDefault(); // Prevent default tab behavior

    const newLines = [...lines];

    if (subIndex !== undefined) {
      newLines[mainIndex - 2].sublines[subIndex - 1] = event.target.value;
      newLines.splice(mainIndex-1,1);
     // newLines[mainIndex - 1].sublines.push('');
    } else {
      newLines[mainIndex - 1].text = event.target.value;
      if (!event.target.value.endsWith('\t')) {
        newLines[mainIndex - 1].sublines.push('');
      }
    }

    setLines(newLines);
  };

  return (
    <div>
      {lines.map((line, mainIndex) => (
        <div key={mainIndex}>
          <span>{mainIndex + 1}</span>
          <input
            type="text"
            value={line.text}
            onChange={(event) => handleInputChange(event, mainIndex + 1)}
            onKeyPress={(event) => {
              if (event.key === 'Enter') {
                handleEnterPress(mainIndex + 1);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Tab') {
                const subIndex = line.sublines.length + 1;
                handleTabPress(event, mainIndex + 1, subIndex);
              }
            }}
            placeholder="Enter your one-line description"
          />
          {line.sublines.map((subline, subIndex) => (
            <div key={`${mainIndex + 1}.${subIndex + 1}`} style={{ marginLeft: '20px' }}>
              <span>{mainIndex + 1}.{subIndex + 1}</span>
              <input
                type="text"
                value={subline}
                onChange={(event) => handleInputChange(event, mainIndex + 1, subIndex + 1)}
                onKeyPress={(event) => {
                  if (event.key === 'Enter') {
                    handleEnterPress(mainIndex + 1);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Tab') {
                    const nextSubIndex = subIndex + 1;
                    handleTabPress(event, mainIndex + 1, nextSubIndex);
                  }
                }}
                placeholder="Enter your description"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default DescriptionInput;