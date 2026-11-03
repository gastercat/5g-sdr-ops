export function renderEvidence(claim, evidence, footnote) {
  const list = document.querySelector('#evidence-list');
  list.replaceChildren();

  for (const item of [claim, ...evidence]) {
    const row = document.createElement('li');
    row.className = 'evidence-item';
    const badge = document.createElement('span');
    const style = item.status.toLowerCase().replace('_', '-');
    badge.className = 'status-badge status-' + style;
    badge.textContent = item.status;
    const copy = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = item.label || item.title;
    const detail = document.createElement('p');
    detail.textContent = item.detail;
    const disclosure = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = '查看來源';
    summary.setAttribute('aria-label', '查看來源：' + (item.label || item.title));
    const source = document.createElement('p');
    source.className = 'evidence-source';
    source.textContent = item.reference || item.source;
    disclosure.append(summary, source);
    copy.append(title, detail);
    if (item.type) {
      const provenance = document.createElement('p'); provenance.className = 'evidence-provenance';
      provenance.textContent = item.type; copy.append(provenance);
    }
    copy.append(disclosure);
    row.append(badge, copy);
    list.append(row);
  }

  document.querySelector('#evidence-footnote').textContent = footnote;
}
