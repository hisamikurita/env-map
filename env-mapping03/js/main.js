//無名関数で全体を囲んで外部から参照されないようにする。
(() => {
    //ページが読み込まれたとき
    window.addEventListener('load', () => {
        initStats();
        init();
    });

    //リサイズした時
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    var cubeTextureLoader = null;
    var objLoader = null;
    var scene = null;
    var renderer = null;
    var camera = null;
    var shader = null;
    var cubeMaterial = null;
    var cubeMesh = null;
    var model = null;
    var material = null;
    var stats = null;
    var orbitcontrols = null;
    var imagesPath = ['../images/img.jpg', '../images/img.jpg', '../images/img.jpg', '../images/img.jpg', '../images/img.jpg', '../images/img.jpg'];
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

            cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100), cubeMaterial);
            // scene.add(cubeMesh);

            objLoader = new THREE.OBJLoader();
            objLoader.load('../model/glass.obj', (obj) => {
                controls = new function () {
                    this.color = 0xf0f0ff;
                    this.refractionRatio = .75;
                    this.reflectivity = .9;
                    this.opacity = .8;
                    this.transparent = true;
                    this.redraw = () => {
                        if (model) {
                            scene.remove(model);
                            window.cancelAnimationFrame(render);
                        }
                        model = obj;
                        model.position.set(0, -16, 0);
                        model.rotation.set(0, 0, 0);
                        model.scale.set(.2, .2, .2);

                        cubeTexture.mapping = THREE.CubeRefractionMapping; //屈折マッピングを適用
                        material = new THREE.MeshBasicMaterial({
                            color: controls.color,
                            envMap: cubeTexture, //マッピングを適用
                            refractionRatio: controls.refractionRatio,//屈折率
                            reflectivity: controls.reflectivity, //映り込み量を設定
                            opacity: controls.opacity,
                            transparent: controls.transparent, //透明を有効に
                        });

                        for (let i = 0; i < model.children.length; i++) {
                            model.children[i].material = material;
                        }
                        model.material = material;
                        scene.add(model);
                    }
                };
                render();
                gui = new dat.GUI();
                gui.addColor(controls, 'color').onChange(controls.redraw);
                gui.add(controls, 'refractionRatio', 0, 1).onChange(controls.redraw);
                gui.add(controls, 'reflectivity', 0, 1).onChange(controls.redraw);
                gui.add(controls, 'opacity', 0, 1).onChange(controls.redraw);
                gui.add(controls, 'transparent').onChange(controls.redraw);
                controls.redraw();
            });
        });

        //カメラを作成
        camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            1,
            1000,
        );
        camera.position.set(0, 0, 60);
        camera.lookAt(scene.position);

        //レンダラーを作成
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(new THREE.Color(0x000000)); //背景色を指定
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        wrapper = document.querySelector('#webgl');
        wrapper.appendChild(renderer.domElement);

        // 軸ヘルパーの作成
        axesHelper = new THREE.AxesHelper(10.0);
        scene.add(axesHelper);

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

        // model.rotation.y += .1;
        // cubeMesh.rotation.y += .01;
        // scene.rotation.y += .01;
        renderer.render(scene, camera);
        window.requestAnimationFrame(render);
    }
})();