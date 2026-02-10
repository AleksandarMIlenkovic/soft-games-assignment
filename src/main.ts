import { GameManager } from "./GameManager";
import { MenuScene } from "./scenes/MenuScene";


(async () => {
  const gameManager = new GameManager();

  await gameManager.init();

  gameManager.changeScene(MenuScene);

  console.log("[Main] Application started successfully");
})();
