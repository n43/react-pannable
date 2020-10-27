import React, { useCallback } from 'react';
import { AutoResizing } from 'react-pannable';

const AR = () => {
  const onResize = useCallback(size => {
    console.log('Resize:', size);
  }, []);
  return (
    <AutoResizing height={600} onResize={onResize}>
      {size => {
        return (
          <div
            style={{
              width: size.width,
              height: size.height,
              backgroundColor: '#ff0',
            }}
          ></div>
        );
      }}
    </AutoResizing>
  );
};

export default AR;
