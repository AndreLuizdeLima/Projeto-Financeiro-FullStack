const cells = Array.from({ length: 9 }, (_, index) => index)

function SessionLoader() {
  return (
    <div className="session-loader" aria-hidden="true">
      {cells.map((cell) => (
        <span
          key={cell}
          className="session-loader__cell"
          style={{ animationDelay: `${cell * 100}ms` }}
        />
      ))}
    </div>
  )
}

export { SessionLoader }
