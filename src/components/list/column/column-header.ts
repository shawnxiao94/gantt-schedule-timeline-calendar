/**
 * ListColumnHeader component
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import { Vido, ColumnData } from '../../../gstc';

export interface Props {
  column: ColumnData;
}

export default function ListColumnHeader(vido: Vido, props: Props) {
  const { api, state, onDestroy, onChange, Actions, update, createComponent, html, cache, StyleMap } = vido;

  const actionProps = { ...props, api, state };

  let wrapper;
  onDestroy(state.subscribe('config.wrappers.ListColumnHeader', (value) => (wrapper = value)));

  const componentName = 'list-column-header';
  const componentActions = api.getActions(componentName);

  const componentsSubs = [];
  let ListColumnHeaderResizerComponent;
  componentsSubs.push(
    state.subscribe('config.components.ListColumnHeaderResizer', (value) => (ListColumnHeaderResizerComponent = value))
  );
  const ListColumnHeaderResizer = createComponent(ListColumnHeaderResizerComponent, props);

  let ListColumnRowExpanderComponent;
  componentsSubs.push(
    state.subscribe('config.components.ListColumnRowExpander', (value) => (ListColumnRowExpanderComponent = value))
  );
  const ListColumnRowExpander = createComponent(ListColumnRowExpanderComponent, props);
  onDestroy(() => {
    ListColumnHeaderResizer.destroy();
    ListColumnRowExpander.destroy();
    componentsSubs.forEach((unsub) => unsub());
  });

  onChange((changedProps) => {
    props = changedProps;
    for (const prop in props) {
      actionProps[prop] = props[prop];
    }
    ListColumnHeaderResizer.change(props);
    ListColumnRowExpander.change(props);
  });

  let className, contentClass;
  onDestroy(
    state.subscribe('config.classNames', () => {
      className = api.getClass(componentName);
      contentClass = api.getClass(componentName + '-content');
    })
  );

  const styleMap = new StyleMap({
    height: '',
    ['--height' as any]: '',
    ['--paddings-count' as any]: '',
  });
  onDestroy(
    state.subscribe('config.headerHeight', () => {
      const value = state.get('config');
      styleMap.style['height'] = value.headerHeight + 'px';
      styleMap.style['--height'] = value.headerHeight + 'px';
      styleMap.style['--paddings-count'] = '1';
      update();
    })
  );

  function withExpander() {
    return html`
      <div class=${contentClass}>
        ${ListColumnRowExpander.html()}${ListColumnHeaderResizer.html(props.column)}
      </div>
    `;
  }

  function withoutExpander() {
    return html`
      <div class=${contentClass}>
        ${ListColumnHeaderResizer.html(props.column)}
      </div>
    `;
  }

  const actions = Actions.create(componentActions, actionProps);

  return (templateProps) =>
    wrapper(
      html`
        <div class=${className} style=${styleMap} data-actions=${actions}>
          ${cache(props.column.expander ? withExpander() : withoutExpander())}
        </div>
      `,
      { vido, props, templateProps }
    );
}
