import { useContext } from 'react';
import AlertContext from '../Contexts/AlertContext';

const useAlert = () => useContext(AlertContext);

export default useAlert;