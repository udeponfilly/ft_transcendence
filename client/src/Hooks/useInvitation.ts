import { useContext } from 'react';
import InvitationContext from '../Contexts/InvitationContext';

const useInvitation = () => useContext(InvitationContext);

export default useInvitation;