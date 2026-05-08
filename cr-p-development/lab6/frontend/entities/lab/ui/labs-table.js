window.FSD = window.FSD || {};
window.FSD.entities = window.FSD.entities || {};
window.FSD.entities.lab = window.FSD.entities.lab || {};
window.FSD.entities.lab.ui = window.FSD.entities.lab.ui || {};

window.FSD.entities.lab.ui.LabsTable = function LabsTable(props) {
  const { labs, dict, onDelete } = props;

  return (
    <div className="table-wrap mt-3">
      <table className="table table-striped align-middle mb-0">
        <thead>
          <tr>
            <th>{dict.tableThNum}</th>
            <th>{dict.tableThName}</th>
            <th>{dict.tableThTheme}</th>
            <th>{dict.tableThYear}</th>
            <th>{dict.tableThLink}</th>
            <th>{dict.tableThImage}</th>
            <th>{dict.tableThActions}</th>
          </tr>
        </thead>
        <tbody>
          {labs.length === 0 && (
            <tr>
              <td colSpan="7">{dict.labNoData}</td>
            </tr>
          )}
          {labs.map((lab) => (
            <tr key={lab.id}>
              <td>{lab.number}</td>
              <td>{lab.title}</td>
              <td>{lab.theme}</td>
              <td>{lab.year || "-"}</td>
              <td>
                {lab.url ? (
                  <a href={lab.url} target="_blank" rel="noopener noreferrer">{lab.url}</a>
                ) : (
                  "-"
                )}
              </td>
              <td>
                {lab.image ? (
                  <>
                    <img src={lab.image} alt={lab.title || ""} className="admin-lab-image" />
                    <div className="small text-muted">{lab.image}</div>
                  </>
                ) : (
                  "-"
                )}
              </td>
              <td>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => onDelete(Number(lab.id))}
                >
                  {dict.labDelete}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
