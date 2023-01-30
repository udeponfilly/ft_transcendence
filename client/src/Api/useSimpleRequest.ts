import {useState} from 'react';

const useSimpleRequest = (mutation: any, params: any) => {
	const [sent, setState] = useState(false)
	const [mutationFct, {
		data: data,
		isLoading,
		isError,
		isSuccess,
		error
	}] = mutation()
	if (!sent)
	{
		mutationFct(params)
		setState(true)
	}
	if (isSuccess)
		return data
	else if (isError)
		throw error;
}

export default useSimpleRequest;