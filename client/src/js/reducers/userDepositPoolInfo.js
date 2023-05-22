const userDepositPoolInfoReducer = (state = '', action) => {
	switch (action.type) {
		case 'UPDATE_USER_DEPOSIT_POOL_INFO':
			return action.value
		default:
			return state
	}
}

export default userDepositPoolInfoReducer