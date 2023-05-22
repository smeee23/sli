const burnPitBalancesReducer = (state = '', action) => {
	switch (action.type) {
		case 'UPDATE_BURN_PIT_BALANCES':
			return action.value
		default:
			return state
	}
}

export default  burnPitBalancesReducer