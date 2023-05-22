const txResultReducer = (state = '', action) => {
	switch (action.type) {
		case 'TX_RESULT':
			return action.value
		default:
			return state
	}
}

export default txResultReducer