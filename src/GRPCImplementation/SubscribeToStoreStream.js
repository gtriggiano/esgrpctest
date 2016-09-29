function SubscribeToStoreStream ({store}) {
  return (call) => {
    let subscription = store.eventsStream.subscribe(evt => call.write(evt))
    call.on('end', () => {
      subscription.unsubscribe()
      call.end()
    })
  }
}

export default SubscribeToStoreStream
