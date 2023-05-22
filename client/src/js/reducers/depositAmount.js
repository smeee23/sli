const depositAmountReducer = (state = '', action) => {
	switch (action.type) {
		case 'UPDATE_DEPOSIT_AMOUNT':
			return action.value
		default:
			return state
	}
}

export default  depositAmountReducer