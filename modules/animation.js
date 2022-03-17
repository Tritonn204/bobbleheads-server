export const bobbleheadMix = (skeleton) => {
    setMix(skeleton, "Idle", "Walk", 0.2)
    setMix(skeleton, "Run", "Idle", 0.5)
    setMix(skeleton, "Run", "Walk", 0.35)
    setMixAll(skeleton, "Jump", 0.3);
    setMixAll(skeleton, "Crouch", 0.25);
    setMixAll(skeleton, "Punch A", 0.05);
    setMixAll(skeleton, "Punch B", 0.05);
    setMixAll(skeleton, "Punch C", 0.15);
    setMixAll(skeleton, "Guard", 0.15);
    setMixAll(skeleton, "Walk Guard", 0.15);
    setMixAll(skeleton, "Hurt A", 0.15);
    setMixAll(skeleton, "Hurt B", 0.15);
}

export const setMixAll = (skeleton, name, value) => {
    skeleton.spineData.animations.forEach(anim => {
        skeleton.stateData.setMix(name, anim.name, value);
        skeleton.stateData.setMix(anim.name, name, value);
    })
}

export const setMix = (skeleton, from, to, value) => {
    skeleton.stateData.setMix(from, to, value);
    skeleton.stateData.setMix(to, from, value);
}
