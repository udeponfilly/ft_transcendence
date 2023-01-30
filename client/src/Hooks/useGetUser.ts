import { selectCurrentUser } from './authSlice'
import { useSelector } from "react-redux"

export default function useGetUser () {
  	const user = useSelector(selectCurrentUser)
    return (user)
}