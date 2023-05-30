const activeBalancesReducer = (state = 'Connect', action) => {
	switch (action.type) {
		case 'UPDATE_ACTIVE_BALANCES':
			return action.value
		default:
			return state
	}
}

export default activeBalancesReducer