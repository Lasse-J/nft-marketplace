import { createSelector } from 'reselect';

const items = state => state.marketplace.items;

export const itemSelector = createSelector(
  items,
  (items) => items.filter(item => item.args.active)
);
