const sliETHInfoReducer = (state = '', action) => {
	switch (action.type) {
		case 'SLIETH_INFO':
			return action.value
		default:
			return state
	}
}

export default sliETHInfoReducer