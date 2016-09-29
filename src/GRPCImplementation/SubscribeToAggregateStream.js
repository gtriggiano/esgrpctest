function SubscribeToAggregateStream ({store}) {
  return (call) => {
    let { uuid, type } = call.request
    let subscription = store.eventsStream
                        .filter(({aggregateIdentity}) => aggregateIdentity.uuid === uuid && aggregateIdentity.type === type)
                        .subscribe(evt => call.write(evt))

    call.on('end', () => {
      subscription.unsubscribe()
      call.end()
    })
  }
}

export default SubscribeToAggregateStream
