//無名関数で全体を囲んで外部から参照されないようにする。
(() => {
    //ページが読み込まれたとき
    window.addEventListener('load', () => {
        initStats();
        init();
        render();
    });

    //リサイズした時
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    var cubeTextureLoader = null;
    var scene = null;
    var renderer = null;
    var camera = null;
    var shader = null;
    var cubeMaterial = null;
    var cubeMesh = null;
    var torusGeo01 = null;
    var torusMaterial01 = null;
    var torusMesh01 = null;
    var stats = null;
    var orbitcontrols = null;
    var imagesPath = ['../images/posx.jpg', '../images/negx.jpg', '../images/posy.jpg', '../images/negy.jpg', '../images/posz.jpg', '../images/negz.jpg'];
    var controls = null;
    var gui = null;

    //初期化処理
    function init() {

        //シーンを作成
        scene = new THREE.Scene();

        cubeTextureLoader = new THREE.CubeTextureLoader();
        cubeTextureLoader.load(imagesPath, function (cubeTexture) {
            shader = THREE.ShaderLib['cube'];
            shader.uniforms['tCube'].value = cubeTexture;
            cubeMaterial = new THREE.ShaderMaterial({
                fragmentShader: shader.fragmentShader,
                vertexShader: shader.vertexShader,
                uniforms: shader.uniforms,
                depthWrite: false,
                side: THREE.BackSide
            });

            cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(200, 200, 200), cubeMaterial);
            scene.add(cubeMesh);

            controls = new function () {
                this.color = 0xf0f0ff;
                this.refractionRatio = .75;
                this.reflectivity = .9;
                this.opacity = .8;
                this.transparent = true;
                this.redraw = () => {
                    if (torusMesh01) {
                        scene.remove(torusMesh01);
                    }
                    cubeTexture.mapping = THREE.CubeRefractionMapping; //屈折マッピングを適用
                    torusGeo01 = new THREE.TorusGeometry(10, 4, 16, 100)
                    torusMaterial01 = new THREE.MeshBasicMaterial({
                        color: controls.color,
                        envMap: cubeTexture, //マッピングを適用
                        refractionRatio: controls.refractionRatio,//屈折率
                        reflectivity: controls.reflectivity, //映り込み量を設定
                        opacity: controls.opacity,
                        transparent: controls.transparent, //透明を有効に
                    });

                    torusMesh01 = new THREE.Mesh(torusGeo01, torusMaterial01);
                    scene.add(torusMesh01);
                }
            };
            gui = new dat.GUI();
            gui.addColor(controls, 'color').onChange(controls.redraw);
            gui.add(controls, 'refractionRatio', 0, 1).onChange(controls.redraw);
            gui.add(controls, 'reflectivity', 0, 1).onChange(controls.redraw);
            gui.add(controls, 'opacity', 0, 1).onChange(controls.redraw);
            gui.add(controls, 'transparent').onChange(controls.redraw);
            controls.redraw();
        });

        //カメラを作成
        camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            1,
            1000,
        );
        camera.position.set(-30, 40, 30);
        camera.lookAt(scene.position);

        //レンダラーを作成
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(new THREE.Color(0xEEEEEE)); //背景色を指定
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        wrapper = document.querySelector('#webgl');
        wrapper.appendChild(renderer.domElement);

        // 軸ヘルパーの作成
        // axesHelper = new THREE.AxesHelper(10.0);
        // scene.add(axesHelper);

        // コントロール
        orbitcontrols = new THREE.OrbitControls(camera, renderer.domElement);
    }

    function initStats() {
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.right = '0px';
        stats.domElement.style.pointerEvents = 'none';
        document.getElementById('stats').appendChild(stats.domElement);
        return stats;
    }

    function render() {
        stats.update();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
})();