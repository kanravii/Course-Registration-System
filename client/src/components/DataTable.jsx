// Generic table. `columns` is a list of { header, render }, where render(row) returns what to show.
// rowClassName (optional) lets a page style certain rows, e.g. grey out excluded courses later.
function DataTable({ columns, rows, getRowKey, emptyMessage = 'No records found.', rowClassName }) {
  if (rows.length === 0) {
    return <p className="empty-message">{emptyMessage}</p>
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.header}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className={rowClassName ? rowClassName(row) : undefined}>
              {columns.map((col) => (
                <td key={col.header}>{col.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable