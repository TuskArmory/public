let plr = Player.getPlayer();

// Authored by Raeders
// I would kill myself if I had to map the GOR for this. Maybe I should make a tool for that?
// USAGE: Put a rail as the route using one of these as an example, then start in the middle of the rail
let TestRoute = [
  PositionCommon.createBlockPos(2, -62, 90),
  PositionCommon.createBlockPos(2, -62, -212),
  PositionCommon.createBlockPos(54, -62, -212),
  PositionCommon.createBlockPos(54, -62, -265),
  PositionCommon.createBlockPos(154, -62, -365),
];
let PaviaIcenia = [
  PositionCommon.createBlockPos(-3743, 3, -4314),
  PositionCommon.createBlockPos(-3720, 3, -4314),
  PositionCommon.createBlockPos(-3720, 3, -2970),
  PositionCommon.createBlockPos(400, 3, -2970),
];
let BlueCoveIcenia = [
  PositionCommon.createBlockPos(-8963, 10, -358),
  PositionCommon.createBlockPos(-7639, 10, -358),
  PositionCommon.createBlockPos(-3837, 10, -4160),
];
let route = BlueCoveIcenia;

let axes = [
  "minecraft:diamond_axe",
  "minecraft:stone_axe",
  "minecraft:iron_axe",
];
// A double lane should assume the route coord is in between the rails, a single lane should assume the route coords are on the copper blocks
// TODO: Implement single lane
let lanes = 2;
let actionBarMessage = "";

function getRailLength() {
  let goal_index = 1;
  let dist = 0;
  for (part of route) {
    if (goal_index == route.length) {
      break;
    }
    dist += PositionCommon.createVec(
      part.getX(),
      part.getY(),
      part.getZ(),
      route[goal_index].getX(),
      route[goal_index].getY(),
      route[goal_index].getZ()
    ).getMagnitude();
    goal_index += 1;
  }

  return dist;
}
function summonItem(
  itemId,
  preferredHotbarSlot = 1,
  minimumDura = 15,
  predicate
) {
  let inv = Player.openInventory();
  let slots = inv.getMap();

  let slot = slots["hotbar"][inv.getSelectedHotbarSlotIndex()];
  let item = inv.getSlot(slot);
  let dura = item.getMaxDamage() - item.getDamage();
  if (
    item.getItemId() === itemId &&
    (minimumDura === -1 || dura > minimumDura)
  ) {
    if (predicate != undefined) {
      if (predicate(item)) {
        return true;
      }
    } else {
      return true;
    }
  }

  for (slot of slots["hotbar"]) {
    if (slot) {
      let item = inv.getSlot(slot);
      let dura = item.getMaxDamage() - item.getDamage();
      if (
        item.getItemId() === itemId &&
        (minimumDura == -1 || dura > minimumDura)
      ) {
        if (predicate != undefined && !predicate(item)) {
          continue;
        }
        inv.setSelectedHotbarSlotIndex(slot - 36);

        return true;
      }
    }
  }
  for (slot of slots["main"]) {
    if (slot) {
      let item = inv.getSlot(slot);
      dura = item.getMaxDamage() - item.getDamage();
      if (
        item.getItemId() === itemId &&
        (minimumDura === -1 || dura > minimumDura)
      ) {
        if (predicate != undefined && !predicate(item)) {
          continue;
        }
        Chat.log(`${slot}`);
        inv.swapHotbar(slot, preferredHotbarSlot);
        Time.sleep(250);
        inv.setSelectedHotbarSlotIndex(preferredHotbarSlot);

        return true;
      }
    }
  }
  return false;
}
function blockToCoordinate(x) {
  return Math.floor(x) + 0.5;
}
function safeWalkTo(x, z, precise, timeout) {
  let position = Player.getPlayer().getPos(); //gets position
  let tx = 0;
  let tz = 0;
  if (precise) {
    tx = x;
    tz = z;
    if (x == null) {
      tx = Player.getPlayer().getX();
    }
    if (z == null) {
      tz = Player.getPlayer().getZ();
    }
  } else {
    if (x != null) {
      tx = blockToCoordinate(x);
    }
    if (z != null) {
      tz = blockToCoordinate(z);
    }
  }
  //   Chat.log("walking to " + tx + ", " + tz);

  KeyBind.keyBind("key.forward", true);
  let timer = 0;
  let flag = false;
  let firstPitch = Player.getPlayer().getPitch();
  Player.getPlayer().lookAt(tx, Player.getPlayer().getY(), tz);
  Player.getPlayer().lookAt(Player.getPlayer().getYaw(), firstPitch);
  while (true) {
    Client.waitTick();

    timer += 1;

    position = Player.getPlayer().getPos();
    if (Math.abs(position.x - tx) <= 1 && Math.abs(position.z - tz) <= 1) {
      Player.getPlayer().lookAt(tx, 0, tz);

      if (Player.getCurrentPlayerInput().sneaking == false) {
        KeyBind.keyBind("key.sneak", true);
      }
    }
    if (
      Math.abs(position.x - tx) < 0.075 &&
      Math.abs(position.z - tz) < 0.075
    ) {
      Player.getPlayer().lookAt(tx, Player.getPlayer().getY(), tz);
      Player.getPlayer().lookAt(Player.getPlayer().getYaw(), firstPitch);
      KeyBind.keyBind("key.forward", false);
      KeyBind.keyBind("key.sneak", false);
      break;
    }
    if (timeout && timer > timeout) {
      Chat.log("walkTo timed out");

      KeyBind.keyBind("key.forward", false);
      KeyBind.keyBind("key.sneak", false);
      return false;
    }
  }
  return true;
}
function eat() {
  let inv = Player.openInventory();
  let minfood = 12;
  let listOfFood = [
    "minecraft:apple",
    "minecraft:mushroom_stew",
    "minecraft:bread",
    "minecraft:cooked_porkchop",
    "minecraft:cooked_cod",
    "minecraft:cooked_salmon",
    "minecraft:cookie",
    "minecraft:melon_slice",
    "minecraft:cooked_beef",
    "minecraft:cooked_chicken",
    "minecraft:carrot",
    "minecraft:baked_potato",
    "minecraft:pumpkin_pie",
    "minecraft:cooked_rabbit",
    "minecraft:rabbit_stew",
    "minecraft:cooked_mutton",
    "minecraft:beetroot_soup",
    "minecraft:sweet_berries",
    "minecraft:golden_apple",
  ];

  if (Player.getPlayer()?.getFoodLevel() || 0 >= minfood) {
    return true;
  }
  KeyBind.keyBind("key.use", false);
  for (const food of listOfFood) {
    // eat given food till no longer hungry || food is gone
    while (Player.getPlayer()?.getFoodLevel() || 0 < minfood) {
      // @ts-ignore TODO: This shouldn't error? The arguments it complains about are optional
      grabItem(food);
      KeyBind.keyBind("key.use", true); // eat forever
      Client.waitTick(100);
      // leave at }of while loop
    }

    if (Player.getPlayer()?.getFoodLevel() || 100 >= minfood) {
      // stop eating
      KeyBind.keyBind("key.use", false);
      return true;
    }
  }

  KeyBind.keyBind("key.use", false);
  return false;
}

function rotateUnit45Deg(direction) {
  return PositionCommon.createPos(
    direction.getX(),
    direction.getY(),
    direction.getZ()
  );
}
function cleanLine(pointA, pointB, reversed) {
  let direction = PositionCommon.createPos(
    pointB.getX() - pointA.getX(),
    pointB.getY() - pointA.getY(),
    pointB.getZ() - pointA.getZ()
  )
    .toVector()
    .normalize()
    .getEnd();

  KeyBind.keyBind("key.sprint", true);
  KeyBind.keyBind("key.attack", true);
  let refreshDirection = getRouteRightRailCleanDir(pointA, pointB);
  refreshDirection = refreshDirection.multiply(
    reversed
      ? PositionCommon.createPos(-1, 1, -1)
      : PositionCommon.createPos(1, 1, 1)
  );
  let lastCorrectPos = pointA;
  let timer_to_recover = 100;
  let jumping = 4;
  while (Math.round(plr.getBlockPos().distanceTo(pointB)) > 0) {
    // Walk to the next block
    if (plr.getPos().getY() < pointA.getY()) {
      KeyBind.keyBind("key.right", false);
      KeyBind.keyBind("key.attack", false);
      if (pointA.getY() - plr.getBlockPos().getY() > 10) {
        // give up lol
        Client.disconnect();
      }

      summonItem("minecraft:stone", 1, -1);
      plr.lookAt(plr.getPos().x, plr.getPos().y - 1, plr.getPos().z);
      KeyBind.keyBind("key.jump", true);
      Client.waitTick();
      KeyBind.keyBind("key.jump", false);

      Client.waitTick(2);
      KeyBind.keyBind("key.use", true);
      Client.waitTick();
      KeyBind.keyBind("key.use", false);
      timer_to_recover -= 1;
    } else {
      timer_to_recover = 100;
    }
    let summonedAxe = false;
    for (axe_id of axes) {
      if (summonItem(axe_id, 0, 5)) {
        summonedAxe = true;
        break;
      }
    }

    if (!summonedAxe) {
      Chat.log("§cOut of axes");
      Client.disconnect();
      break;
    }
    let lookDir = plr.getPos().add(refreshDirection);
    plr.lookAt(lookDir.getX(), lookDir.getY(), lookDir.getZ());
    Client.waitTick();
    KeyBind.keyBind("key.attack", true);
    KeyBind.keyBind("key.right", plr.getBlockPos().getY() == pointA.getY());
    eat();
    // Correct y-level if fallen
    let progress = Math.round(
      (plr.getBlockPos().distanceTo(pointB) * 100) / pointA.distanceTo(pointB)
    );
    actionBarMessage =
      `§aCleaning from (${pointA.getX()},${pointA.getY()},${pointA.getZ()}) to (${pointB.getX()},${pointB.getY()},${pointB.getZ()})` +
      ` (${100 - progress}%)`;
  }
  KeyBind.keyBind("key.attack", false);
  KeyBind.keyBind("key.right", false);
  KeyBind.keyBind("key.sprint", false);
}
function lerp(a, b, t) {
  return a + t * (b - a);
}

function isOnLine(A, B, C) {
  let abDist = PositionCommon.createVec(
    A.getX(),
    A.getZ(),
    B.getX(),
    B.getZ()
  ).getMagnitude();
  let acDist = PositionCommon.createVec(
    A.getX(),
    A.getZ(),
    C.getX(),
    C.getZ()
  ).getMagnitude();
  let bcDist = PositionCommon.createVec(
    C.getX(),
    C.getZ(),
    B.getX(),
    B.getZ()
  ).getMagnitude();

  return acDist + bcDist == abDist;
}

function vecToDirection(predecessor, successor) {
  let distance = successor.toPos3D().sub(predecessor.toPos3D());
  distance = Math.sqrt(distance.X ^ (2 + distance.Z) ^ (2 + distance.Y) ^ 2);

  return successor
    .toPos3D()
    .sub(predecessor.toPos3D())
    .divide(distance, distance, distance);
}

function getRouteRightRailCleanDir(predecessor, successor) {
  let route_clean_direction = vecToDirection(predecessor, successor);

  let resultX = route_clean_direction.getX();
  // Round directions
  if (Math.abs(resultX) > 0.8) {
    resultX = Math.sign(resultX);
  } else if (Math.abs(resultX) < 0.6) {
    resultX = 0;
  }

  let resultZ = route_clean_direction.getZ();
  if (Math.abs(resultZ) > 0.8) {
    resultZ = Math.sign(resultZ);
  } else if (Math.abs(resultZ) < 0.6) {
    resultZ = 0;
  }

  return PositionCommon.createPos(
    resultZ * -Math.sign(resultZ),
    -1,
    resultX * -Math.sign(resultX)
  );
}
function actionBarManager() {
  return JsMacros.on(
    "Tick",
    JavaWrapper.methodToJava((event) => {
      Chat.actionbar("§4[TUSK RAIL]§r " + actionBarMessage);
    })
  );
}

function main(recursive) {
  let blockPos = plr.getBlockPos();
  let routeStart = route[0];
  let routeEnd = route[route.length - 1];
  const startTime = Time.time();

  let started_cleaning = false;
  let possible_goal_index = 1;
  let predecessor, successor;
  for (part of route) {
    if (possible_goal_index >= route.length) {
      break;
    }
    if (
      !isOnLine(part, route[possible_goal_index], blockPos) ||
      possible_goal_index != route.length - 1
    ) {
      possible_goal_index += 1;
      continue;
    }
    predecessor = part;
    successor = route[possible_goal_index];
    possible_goal_index += 1;
  }
  if (predecessor && successor) {
    actionBarManager();
    let direction = plr.getFacingDirection().getVector();
    let route_clean_direction = getRouteRightRailCleanDir(
      predecessor,
      successor
    );
    let dot = route_clean_direction
      .toVector()
      .multiply(1, 0, 1, 1, 0, 1)
      .dotProduct(direction.toVector());
    let increment = 1;
    let reversed = false;

    // Normally clean from start to finish, but if we're looking at the rail's return route we clean from finish to start
    if (dot < 0) {
      reversed = true;
      route.reverse();
    }

    Chat.log(`§aRunning rail repair for ${Math.round(getRailLength())}m`);
    let goal_index = 1;
    for (part of route) {
      if (goal_index >= route.length) {
        break;
      }

      if (!isOnLine(part, route[goal_index], blockPos) && !started_cleaning) {
        goal_index += increment;
        continue;
      }
      started_cleaning = true;
      safeWalkTo(
        Player.getPlayer().getBlockPos().getX(),
        Player.getPlayer().getBlockPos().getZ()
      );
      cleanLine(part, route[goal_index], reversed);
      KeyBind.keyBind("key.right", false);
      goal_index += increment;
    }

    if (!recursive) {
      Player.getPlayer().lookAt(
        -Player.getPlayer().getYaw(),
        Player.getPlayer().getPitch()
      );
      Client.waitTick(4);
      main(true);
    }

    let length = getRailLength();
    let time = (Time.time() - startTime) / 1000;
    if (!recursive) {
      // m/s should be about half the standard movement speed because you have two passes. Depending on the terrain of the rail this could also be worse, like the Pavia-Icenia rail which has holes in the walkway
      Chat.log(
        `§a${Math.round(getRailLength())}m of rail repaired at ${Math.round(
          length / time
        )}m/s`
      );
    }
    JsMacros.disableScriptListeners("Tick");
  } else {
    let route0X = routeStart.getX();
    let route0Y = routeStart.getY();
    let route0Z = routeStart.getZ();

    let route1X = routeEnd.getX();
    let route1Y = routeEnd.getY();
    let route1Z = routeEnd.getZ();
    Chat.log(
      `§4Please start the bot in the middle of the rail line with these points: (${route0X}, ${route0Y}, ${route0Z}) => (${route1X}, ${route1Y}, ${route1Z})`
    );
  }
}

main();
