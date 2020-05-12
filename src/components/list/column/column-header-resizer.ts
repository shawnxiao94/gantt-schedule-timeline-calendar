/**
 * ListColumnHeaderResizer component
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

export default function ListColumnHeaderResizer(vido: Vido, props: Props) {
  const { api, state, onDestroy, update, html, Actions, onChange, PointerAction, cache, StyleMap, unsafeHTML } = vido;

  const componentName = 'list-column-header-resizer';
  const componentActions = api.getActions(componentName);
  const componentDotsActions = api.getActions(componentName + '-dots');

  let wrapper;
  onDestroy(state.subscribe('config.wrappers.ListColumnHeaderResizer', (value) => (wrapper = value)));

  let className, containerClass, dotsClass, dotClass, calculatedWidth;
  const dotsStyleMap = new StyleMap({ width: '' });
  let inRealTime = false;
  onDestroy(
    state.subscribe('config.classNames', (value) => {
      className = api.getClass(componentName);
      containerClass = api.getClass(componentName + '-container');
      dotsClass = api.getClass(componentName + '-dots');
      dotClass = api.getClass(componentName + '-dots-dot');
      update();
    })
  );

  const slots = api.generateSlots(componentName, vido, props);

  function updateData() {
    if (!props.column) return;
    const list = state.get('config.list');
    calculatedWidth = props.column.width * list.columns.percent * 0.01;
    dotsStyleMap.style['--width'] = list.columns.resizer.width + 'px';
    inRealTime = list.columns.resizer.inRealTime;
    state.update('$data.list.width', calculatedWidth);
    slots.change(props);
    update();
  }

  onChange((changedProps) => {
    props = changedProps;
    updateData();
  });
  onDestroy(
    state.subscribeAll(
      ['config.list.columns.percent', 'config.list.columns.resizer.width', 'config.list.columns.resizer.inRealTime'],
      updateData
    )
  );

  let dots = [1, 2, 3, 4, 5, 6, 7, 8];
  onDestroy(
    state.subscribe('config.list.columns.resizer.dots', (value) => {
      dots = [];
      for (let i = 0; i < value; i++) {
        dots.push(i);
      }
      update();
    })
  );

  /*
  let isMoving = false;
  const lineStyleMap = new StyleMap({
    '--display': 'none',
    '--left': left + 'px'
  });*/
  let left = calculatedWidth;

  const actionProps = {
    column: props.column,
    api,
    state,
    pointerOptions: {
      axis: 'x',
      onMove: function onMove({ movementX }) {
        let minWidth = state.get('config.list.columns.minWidth');
        if (typeof props.column.minWidth === 'number') {
          minWidth = props.column.minWidth;
        }
        left += movementX;
        if (left < minWidth) {
          left = minWidth;
        }
        if (inRealTime) {
          state.update(`config.list.columns.data.${props.column.id}.width`, left);
        }
      },
    },
  };

  componentActions.push(PointerAction);
  const actions = Actions.create(componentActions, actionProps);
  const dotsActions = Actions.create(componentDotsActions, actionProps);

  return (templateProps) =>
    wrapper(
      html`
        <div class=${className} data-actions=${actions}>
          ${slots.html('before', templateProps)}
          <div class=${containerClass}>
            ${cache(props.column.header.html ? unsafeHTML(props.column.header.html) : props.column.header.content)}
          </div>
          ${slots.html('inside', templateProps)}
          <div class=${dotsClass} style=${dotsStyleMap} data-actions=${dotsActions}>
            ${dots.map((dot) => html` <div class=${dotClass} /> `)}
          </div>
          ${slots.html('after', templateProps)}
        </div>
      `,
      { vido, props, templateProps }
    );
}
