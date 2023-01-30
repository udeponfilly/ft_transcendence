import React from "react"
import Box from "@mui/material/Box";
import "./error.css"

const BadRequestPage = () => {
	return (
		<Box sx={{height: '100vh', backgroundColor: 'white'}}>
			<section className="page_error">
				<div className="container">
					<div className="row">	
					<div className="col-sm-12 ">
					<div className="col-sm-10 col-sm-offset-1  text-center">
					<div className="four_zero_four_bg">
						<h1 className="text-center ">400</h1>
					</div>
					<div className="contant_box_error">
					<h3 className="h2">
						Bad Request
					</h3>
				</div>
					</div>
					</div>
					</div>
				</div>
			</section>
		</Box>
	)
}

export default BadRequestPage