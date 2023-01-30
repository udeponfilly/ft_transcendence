import { useState, ChangeEvent } from "react"
import { Avatar, Stack } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import '../styles/index.scss'

interface PropsAvatarUpload {
	onChange: (file: ChangeEvent<Element>) => void,
	avatarSrc: string
}

export const AvatarUpload = (PropsAvatarUpload: PropsAvatarUpload) => {
	const [fileSrc, setFileSrc] = useState(PropsAvatarUpload.avatarSrc)

	const handleChange = (event: any) => {
		if (event.target.files) {
			setFileSrc(URL.createObjectURL(event.target.files[0]))
			PropsAvatarUpload.onChange(event)
		}
	}

	return (
		<div>		
			<label htmlFor="file-input">
				<Stack direction="row" spacing={0}>
					<Avatar 
						src={fileSrc}
						sx={{ width: 100, height: 100 }}
					/>
					<AddCircleIcon color="primary" sx={{marginLeft: -3, zIndex: 1300}}/>
				</Stack>
			</label>
			<input className="display-none" id="file-input" type="file" onChange={handleChange}/>
		</div>
	)
}
