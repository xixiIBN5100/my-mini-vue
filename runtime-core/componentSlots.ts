import { ShapeFlags } from "@mini-vue/shared";
export function initSlots(instance, children) {
  const { vnode } = instance;

  console.log("初始化 slots");

  if (vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    normalizeObjectSlots(children, (instance.slots = {}));
  }
}

function normalizeValue (value) {
  return Array.isArray(value) ? value : [value]
}

export function normalizeObjectSlots (children, slots) {
  for(const key in children) {
    const value = children(key)

    slots[key] = (props) => normalizeValue(value(props))
  }
}
