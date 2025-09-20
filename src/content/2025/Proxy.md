---
layout: ../../layouts/postsLayout.astro
title:  Vue Reactivity Internals — Proxy
collection: 2025
pubDate: 9/8
slug:  Vue-reactivity-proxy
description: Deep dive into Vue 3's Proxy-based reactivity
---



Vue 3's core reactivity is built on ES6 Proxy. Unlike Object.defineProperty used in Vue 2, Proxy lets the framework intercept operations at the object behavior level rather than per-property. This provides several practical advantages:

- Behavior-level interception: you don't need to walk and redefine every property.
- Detect additions and deletions of properties and changes to array indices.
- Intercept many fundamental operations (get, set, delete, has, ownKeys, etc.).
- Enables both deep and shallow reactive/readonly variants.

However, Proxy only tells you "what happened" to an object at runtime; it doesn't automatically update views. That requires a dependency-tracking system and effects that react to changes.

Key concepts

1. Target-to-Proxy caching (WeakMap)
Vue stores a WeakMap from original target -> proxy so repeated calls to reactive() return the same proxy. This avoids duplicate proxies and preserves identity.

2. Handlers and traps
Common traps used:
- get: collect dependencies (tracking) and return reactive wrappers for nested objects.
- set: determine if the operation is an addition or mutation, then trigger dependent effects.
- deleteProperty: trigger effects when a property is removed.
- has / ownKeys: used to detect iteration or "in" checks, affecting effects for loops or Object.keys/for...in.
- getOwnPropertyDescriptor: sometimes proxied for compatibility.

3. Dependency tracking and effects
When get runs, the runtime records a dependency between the active effect (a function that updates the view) and the accessed reactive property. When set/delete occur, the runtime looks up dependent effects and schedules them for re-run.

Effects usually use:
- a global stack of active effects,
- a Map of target -> key -> Set(effects),
- a scheduler to batch and microtask-run updates (uses Promise.resolve().then(...) in browsers).

4. Arrays and special cases
Arrays are objects, so Proxy handles them too. Vue's handlers carefully treat:
- index updates,
- length changes,
- mutation methods (push/pop/shift/unshift/splice) which internally call traps or are wrapped to ensure correct tracking.

5. Refs and unwrap behavior
Primitives and single-value containers use Ref. In template or reactive objects, refs are automatically unwrapped during get. set will set the inner value or replace the ref depending on context.

6. Readonly, shallow and toRaw
Vue supports readonly proxies and shallow variants:
- readonly: traps for set/delete just warn and do not mutate.
- shallowReactive/shallowReadonly: do not recursively wrap nested objects.
- toRaw(proxy) returns the original target when you need identity or to bypass reactivity.

7. Performance and memory considerations
- WeakMap prevents memory leaks for garbage-collected targets.
- Caching proxies avoids repeated wrapping cost.
- Lazily wrapping nested objects avoids eagerly traversing entire graphs.
- Computed values, effect cleanup, and dependency trees must be managed to avoid stale dependencies.

8. Caveats and pitfalls
- Proxies do not work with reactive detection on non-object values; primitives use refs.
- Accessing raw internal fields with toRaw or bypassing reactivity can lead to inconsistent state.
- Proxies cannot be polyfilled perfectly for older engines, so Vue's Proxy-based reactivity targets modern environments.

Minimal conceptual flow

1. Call reactive(target) -> return cached or new Proxy wrapping target.
2. Reading a property triggers get -> track(effect, target, key) -> return value (wrap nested objects).
3. Writing triggers set -> determine if new or mutation -> trigger effects associated with target/key.
4. Scheduler batches and flushes effects -> DOM updates or computed re-evaluations run.

Conclusion

Vue 3's Proxy-based reactivity design gives correctness and flexibility: it can observe more operations with less per-property boilerplate, enables shallow/readonly variants, and supports modern patterns like refs and computed. The Proxy itself is only one part — efficient dependency tracking, scheduling, and careful handler implementation make the system perform well in real apps.


