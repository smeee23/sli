const withdrawAmountReducer = (state = '', action) => {
	switch (action.type) {
		case 'UPDATE_WITHDRAW_AMOUNT':
			return action.value
		default:
			return state
	}
}

export default  withdrawAmountReducer