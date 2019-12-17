var game;
var gameOptions = {
    ziplamaYukseklik: 300,
    topYercekimi: 1200,
    topGuc: 1200,
    engelAraliklar:[100,250],
    engelHiz:250,
    localStorageIsim:'eniyiskor',
    bonusOran:20,
}

window.onload = function () {
    let gameConfig = {
        type: Phaser.AUTO,
        backgroundColor: 0x87ceeb,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 750,
            height: 500,
            parent: 'thegame'
        },
        physics: {
            default: 'arcade',
            arcade: {
                debug: false,
            }
        },
        scene: playGame
    }

    game = new Phaser.Game(gameConfig);
    window.focus();
}


class playGame extends Phaser.Scene {
    constructor() {
        super('PlayGame');
    }

    preload() {
        this.load.image('zemin', 'zemin.png');
        this.load.image('top', 'top.png');
        // this.load.image('engel', 'engel.png');
        this.load.spritesheet('engel','engel.png',{
            frameWidth:20,frameHeight:40
        })
    }


    create() {

        this.ilkZiplama = 0;
        this.engelGrup = this.physics.add.group();
        //console.log(this.engelGrup);

        this.zemin = this.physics.add.sprite(game.config.width / 2, game.config.height / 4 * 3, 'zemin');
        this.top = this.physics.add.sprite(game.config.width / 10 * 2, game.config.height / 4 * 3 - gameOptions.ziplamaYukseklik, 'top');
        this.top.setBounce(1);

        this.top.body.gravity.y = gameOptions.topYercekimi;
        this.zemin.setImmovable(true);
        this.top.setCircle(25);

        this.input.on('pointerdown', this.hizliDusur, this);

        let engelX = game.config.width;
        for (let i = 0; i < 10; i++) {

            let engel=this.engelGrup.create(engelX,this.zemin.getBounds().top,'engel');
            engel.setOrigin(0.5,1);
            engel.setImmovable(true);
            console.log(engelX);
            engelX =engelX+ Phaser.Math.Between(gameOptions.engelAraliklar[0],gameOptions.engelAraliklar[1]);  
            let oran=Phaser.Math.Between(0,99);
            if(oran<gameOptions.bonusOran){
                engel.setFrame(0);
            }else{
                engel.setFrame(1);
            }
            // engel.setFrame((Phaser.Math.Between(0,99)<gameOptions.bonusOran)?0:1);
        }
        this.engelGrup.setVelocityX(-gameOptions.engelHiz);

        //console.log(this.engelGrup.getChildren());
        this.skor=0;
        let storage=localStorage.getItem(gameOptions.localStorageIsim);
        if(storage==null ||storage=='NaN'){
            this.yuksekSkor=0;
        }
        else{
            this.yuksekSkor=localStorage.getItem(gameOptions.localStorageIsim);
        }
        this.skorText=this.add.text(10,10,'');
        this.skorGuncelle(this.skor);

    }

    hizliDusur() {
        if (this.ilkZiplama != 0) {
            this.top.body.velocity.y = gameOptions.topGuc;
        }
    }

    enSagEngelGetir(){
        let enSagEngel=0;

        this.engelGrup.getChildren().forEach(function(engel){
           enSagEngel=Math.max(enSagEngel,engel.x);
        });
        return enSagEngel;
    }

    skorGuncelle(deger){
        this.skor+=deger;
        this.skorText.text='Skor: '+this.skor+'\nEn İyi: '+this.yuksekSkor;
    }

    engelGuncelle(engel){
        this.skorGuncelle(1);
        engel.x=this.enSagEngelGetir()+Phaser.Math.Between(gameOptions.engelAraliklar[0],gameOptions.engelAraliklar[1]);

        engel.setFrame((Phaser.Math.Between(0,99)<gameOptions.bonusOran)?0:1);
    }



    update() {
        this.physics.world.collide(this.zemin, this.top, function () {
            if (this.ilkZiplama == 0) {
                this.ilkZiplama = this.top.body.velocity.y;
            }
            else {
                this.top.body.velocity.y = this.ilkZiplama;
            }
        }, null, this);

        this.engelGrup.getChildren().forEach(function(engel){

            if(engel.getBounds().right<0){
                if(engel.frame.name==0){
                    localStorage.setItem(gameOptions.localStorageIsim,Math.max(this.skor,this.yuksekSkor));
                    this.scene.start('PlayGame');
                }
                else{
                    this.engelGuncelle(engel)
                }
            }
            
        },this);

        this.physics.world.overlap(this.top,this.engelGrup,function(top,engel){

            if(engel.frame.name==1){
                localStorage.setItem(gameOptions.localStorageIsim,Math.max(this.skor,this.yuksekSkor));
                this.scene.start('PlayGame');
            }else{
               this.engelGuncelle(engel);
            }
        },null,this);

    }
}

