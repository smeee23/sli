const pendingTxListReducer = (state = [], action) => {
	switch (action.type) {
		case 'PENDING_TX_LIST':
			return action.value
		default:
			return state
	}
}

export default pendingTxListReducer