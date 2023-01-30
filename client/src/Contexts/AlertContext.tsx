import { createContext, useState } from 'react';

const ALERT_TIME = 3000;

type AlertColor =  'error' | 'info' | 'success' | 'warning'

interface AlertHooksType {
	text: string,
	type: AlertColor,
}
const initialState: AlertHooksType = {
  text: '',
  type: 'error',
};

const AlertContext = createContext({
  ...initialState,
  setAlert: (text: string, type: AlertColor ) => {(void text); (void type)},
});

export const AlertProvider = ({ children } : any) => {
  const [text, setText] = useState('');
  const [type, setType]: [any, React.Dispatch<React.SetStateAction<any>>]
  	= useState('');

  const setAlert = (text: string, type: AlertColor ) => {
    setText(text);
    setType(type);

    setTimeout(() => {
      setText('');
      setType('');
    }, ALERT_TIME);
  };

  return (
    <AlertContext.Provider
      value={{
        text,
        type,
        setAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;