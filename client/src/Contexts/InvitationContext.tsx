import { createContext } from 'react';

const InvitationContext = createContext({});

export const InvitationProvider = ({ children } : any) => {
	return (
		<InvitationContext.Provider
		value={{}}
		>
		{children}
		</InvitationContext.Provider>
	);
};

export default InvitationContext;