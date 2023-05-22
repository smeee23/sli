const aavePoolAddressReducer = (state = 'Connect', action) => {
	switch (action.type) {
		case 'UPDATE_AAVE_POOL_ADDRESS':
			return action.value
		default:
			return state
	}
}

export default aavePoolAddressReducer